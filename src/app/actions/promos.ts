"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function getPromos() {
  return prisma.promo.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" }
  });
}

// Admin Actions
export async function adminCreatePromo(data: {
  title: string,
  description?: string,
  imageUrl?: string,
  externalLink?: string,
  active?: boolean,
  requiresVerification?: boolean,
  pointsAward?: number
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    await prisma.promo.create({ data });
    revalidatePath("/agent");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminUpdatePromo(id: string, data: {
  title?: string,
  description?: string,
  imageUrl?: string,
  externalLink?: string,
  active?: boolean,
  requiresVerification?: boolean,
  pointsAward?: number
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    await prisma.promo.update({ where: { id }, data });
    revalidatePath("/agent");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminDeletePromo(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    await prisma.promo.delete({ where: { id } });
    revalidatePath("/agent");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadPromoImage(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const uploadDir = join(process.cwd(), "public", "uploads", "promos");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    const url = `/uploads/promos/${fileName}`;

    return { success: true, url };
  } catch (error: any) {
    console.error("Promo Upload Error:", error);
    return { success: false, error: "Failed to upload promo image." };
  }
}

export async function submitPromoProof(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  try {
    const promoId = formData.get("promoId") as string;
    const file = formData.get("file") as File;
    
    if (!promoId || !file) return { success: false, error: "Missing required data" };

    const existing = await prisma.promoSubmission.findFirst({
      where: { promoId, userId: session.user.id }
    });
    if (existing) return { success: false, error: "You have already submitted for this promo" };

    const uploadDir = join(process.cwd(), "public", "uploads", "proofs");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${session.user.id}-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    const url = `/uploads/proofs/${fileName}`;

    await prisma.promoSubmission.create({
      data: {
        promoId,
        userId: session.user.id,
        screenshotUrl: url,
        status: "PENDING"
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Proof Submission Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getAgentSubmissions() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return [];

  return prisma.promoSubmission.findMany({
    where: { userId: session.user.id },
    include: { promo: true },
    orderBy: { createdAt: "desc" }
  });
}

// Admin only: Get all pending submissions
export async function adminGetPendingSubmissions() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return [];

  return prisma.promoSubmission.findMany({
    where: { status: "PENDING" },
    include: { 
      promo: true,
      user: { select: { name: true, username: true } }
    },
    orderBy: { createdAt: "asc" }
  });
}

export async function adminReviewSubmission(submissionId: string, status: "APPROVED" | "REJECTED") {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    const submission = await prisma.promoSubmission.findUnique({
      where: { id: submissionId },
      include: { promo: true, user: true }
    });

    if (!submission) return { success: false, error: "Submission not found" };

    await prisma.$transaction(async (tx) => {
      await tx.promoSubmission.update({
        where: { id: submissionId },
        data: { 
          status,
          reviewedAt: new Date()
        }
      });

      if (status === "APPROVED") {
        // Award points
        await tx.pointTransaction.create({
          data: {
            userId: submission.userId,
            amount: submission.promo.pointsAward,
            currency: submission.promo.currency,
            type: "PROMO",
            description: `Verification Reward: ${submission.promo.title}`,
            status: "COMPLETED"
          }
        });
      }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function claimSimplePromo(promoId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  try {
    const userId = session.user.id;
    const promo = await prisma.promo.findUnique({ where: { id: promoId } });
    
    if (!promo) return { success: false, error: "Promo not found" };
    if (promo.requiresVerification) return { success: false, error: "This promo requires verification" };

    // Check if already submitted/claimed
    const existing = await prisma.promoSubmission.findFirst({
      where: { promoId, userId }
    });
    if (existing) return { success: false, error: "Already claimed" };

    await prisma.$transaction(async (tx) => {
      // Create a submission record as "APPROVED" immediately
      await tx.promoSubmission.create({
        data: {
          promoId,
          userId,
          screenshotUrl: "SYSTEM_CLAIM",
          status: "APPROVED",
          reviewedAt: new Date()
        }
      });

      // Award points
      await tx.pointTransaction.create({
        data: {
          userId,
          amount: promo.pointsAward,
          currency: promo.currency,
          type: "PROMO",
          description: `Promo Claim: ${promo.title}`,
          status: "COMPLETED"
        }
      });

      // --- Daily Mission Bonus Logic ---
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let dailyTask = await tx.userDailyTask.findUnique({
        where: { userId_taskKey: { userId, taskKey: "DAILY_MISSIONS" } }
      });

      if (dailyTask && dailyTask.lastResetAt < today) {
        dailyTask = await tx.userDailyTask.update({
          where: { id: dailyTask.id },
          data: { count: 0, lastResetAt: new Date() }
        });
      }

      if (!dailyTask) {
        dailyTask = await tx.userDailyTask.create({
          data: { userId, taskKey: "DAILY_MISSIONS", count: 0, lastResetAt: new Date() }
        });
      }

      const newCount = dailyTask.count + 1;
      await tx.userDailyTask.update({
        where: { id: dailyTask.id },
        data: { count: newCount }
      });

      if (newCount === 3) {
        await tx.pointTransaction.create({
          data: {
            userId,
            amount: 200,
            type: "DAILY_BONUS",
            description: "Daily Mission Milestone: 3 Missions Completed",
            status: "COMPLETED"
          }
        });

        await tx.notification.create({
          data: {
            userId,
            title: "Daily Goal Achieved!",
            message: "You've earned a +200 PTS bonus for completing 3 missions today!",
            type: "SUCCESS"
          }
        });
      }
      // ---------------------------------
    });

    revalidatePath("/agent/tasks");
    return { success: true };
  } catch (error: any) {
    console.error("Simple Promo Claim Error:", error);
    return { success: false, error: error.message };
  }
}
