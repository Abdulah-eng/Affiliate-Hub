"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import bcrypt from "bcryptjs";

export async function getPendingApplications() {
  return prisma.user.findMany({
    where: { kycStatus: "PENDING" },
    include: { platforms: { include: { brand: true } } },
    orderBy: { kycSubmittedAt: "desc" }
  });
}

export async function reviewApplication(
  userId: string, 
  status: "APPROVED" | "REJECTED" | "REQUEST_REUPLOAD", 
  notes?: string,
  platformAssignments?: { 
    brandId: string; 
    username: string; 
    password?: string;
    playerUsername?: string;
    playerPassword?: string;
  }[]
) {
  try {
    await prisma.$transaction(async (tx) => {
      // Update User KYC status
      await tx.user.update({
        where: { id: userId },
        data: {
          kycStatus: status,
          kycReviewedAt: new Date(),
          kycNotes: notes
        }
      });

      // If approved, setup the platform access credentials
      if (status === "APPROVED" && platformAssignments) {
        for (const assignment of platformAssignments) {
          await tx.platformAccess.upsert({
             where: {
               userId_brandId: {
                 userId: userId,
                 brandId: assignment.brandId
               }
             },
             update: {
               status: "APPROVED",
               username: assignment.username,
               password: assignment.password,
               playerUsername: assignment.playerUsername,
               playerPassword: assignment.playerPassword
             },
             create: {
               userId,
               brandId: assignment.brandId,
               username: assignment.username,
               password: assignment.password,
               playerUsername: assignment.playerUsername,
               playerPassword: assignment.playerPassword,
               status: "APPROVED"
             }
          });
        }
      }

      // Create notification
      let notifyTitle = "Application Updated";
      let notifyMessage = `Your application status has been updated to ${status}.`;
      let notifyType = "INFO";
      
      if (status === "APPROVED") {
        notifyTitle = "Vault Access Approved";
        notifyMessage = "Your KYC has been verified. Welcome. You now have access to your platforms.";
        notifyType = "SUCCESS";
      } else if (status === "REJECTED") {
        notifyTitle = "Application Rejected";
        notifyMessage = notes ? `Your application was rejected: ${notes}` : "Your KYC application was rejected.";
        notifyType = "ERROR";
      } else if (status === "REQUEST_REUPLOAD") {
        notifyTitle = "Action Required: Document Reupload";
        notifyMessage = notes ? `Please reupload documents: ${notes}` : "Please reupload your KYC documents.";
        notifyType = "WARNING";
      }

      await tx.notification.create({
        data: {
          userId,
          title: notifyTitle,
          message: notifyMessage,
          type: notifyType
        }
      });
    });

    revalidatePath("/admin/reviews");
    revalidatePath("/admin/reviews/history");
    return { success: true };
  } catch (error) {
    console.error("KYC Review Error:", error);
    return { success: false, error: "Failed to update review status." };
  }
}

export async function getAllBrands() {
  return prisma.brand.findMany({
    orderBy: { createdAt: "asc" }
  });
}

export async function updateBrandLoginUrl(brandId: string, loginUrl: string) {
  await prisma.brand.update({
    where: { id: brandId },
    data: { loginUrl }
  });
  revalidatePath("/admin/brands");
}

export async function updateBrandStatus(brandId: string, status: string) {
  await prisma.brand.update({
    where: { id: brandId },
    data: { status }
  });
  revalidatePath("/admin/brands");
}

export async function createBrand(name: string, loginUrl: string, logoUrl?: string, playerLoginUrl?: string) {
  try {
    await prisma.brand.create({
      data: { name, loginUrl, logoUrl, playerLoginUrl, status: 'ONLINE', isActive: true }
    });
    revalidatePath("/admin/brands");
    return { success: true };
  } catch (error) {
    console.error("Create Brand Error:", error);
    return { success: false, error: "Failed to create brand. Name may already exist." };
  }
}

export async function updateBrand(brandId: string, data: {
  name?: string,
  loginUrl?: string,
  playerLoginUrl?: string,
  logoUrl?: string,
  description?: string,
  status?: string,
  useIframe?: boolean,
  isActive?: boolean
}) {
  try {
    await prisma.brand.update({
      where: { id: brandId },
      data
    });
    revalidatePath("/admin/brands");
    revalidatePath("/agent");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBrand(brandId: string) {
  try {
    // Delete related platform access records first
    await prisma.platformAccess.deleteMany({ where: { brandId } });
    await prisma.brand.delete({ where: { id: brandId } });
    revalidatePath("/admin/brands");
    return { success: true };
  } catch (error) {
    console.error("Delete Brand Error:", error);
    return { success: false, error: "Failed to delete brand." };
  }
}

export async function getSystemSettings() {
  return prisma.systemSetting.findMany({
    orderBy: { key: "asc" }
  });
}

export async function updateSystemSettings(updates: Record<string, string>) {
  try {
    for (const [key, value] of Object.entries(updates)) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }
    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/admin/cms");
    return { success: true };
  } catch (error: any) {
    console.error("Settings Update Error:", error);
    return { success: false, error: `Failed to update settings: ${error.message}` };
  }
}

export async function getAuditLogs() {
  return prisma.pointTransaction.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 50
  });
}

export async function getReviewHistory() {
  return prisma.user.findMany({
    where: { 
      kycStatus: { not: "PENDING" }
    },
    orderBy: { kycReviewedAt: "desc" },
    take: 50
  });
}

export async function uploadCmsAsset(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const key = formData.get("key") as string;
    
    if (!file || !key) return { success: false, error: "Missing file or key" };

    // Robust absolute pathing
    const uploadDir = join(process.cwd(), "public", "uploads", "cms");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    const url = `/uploads/cms/${fileName}`;

    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: url },
      create: { key, value: url }
    });

    revalidatePath("/");
    revalidatePath("/admin/cms");
    return { success: true, url };
  } catch (error) {
    console.error("CMS Upload Error:", error);
    return { success: false, error: "Failed to upload asset." };
  }
}

export async function uploadBrandLogo(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    // Robust absolute pathing
    const uploadDir = join(process.cwd(), "public", "uploads", "brands");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    const url = `/uploads/brands/${fileName}`;

    return { success: true, url };
  } catch (error: any) {
    console.error("Brand Logo Upload Error:", error);
    return { success: false, error: "Failed to upload brand logo." };
  }
}

export async function getAdminSidebarStats() {
  const [pendingKyc, pendingTasks, pendingPromos, openTickets, pendingRedemptions] = await Promise.all([
    prisma.user.count({ where: { kycStatus: "PENDING" } }),
    prisma.userTaskProgress.count({ where: { status: "PENDING" } }),
    prisma.promoSubmission.count({ where: { status: "PENDING" } }),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.redemptionRequest.count({ where: { status: "PENDING" } })
  ]);

  return {
    pendingKyc,
    pendingMissions: pendingTasks + pendingPromos,
    openTickets,
    pendingRedemptions
  };
}

export async function updateAdminPassword(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "All fields are required" };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "New passwords do not match" };
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id }
    });

    if (!user || !user.password) {
      return { success: false, error: "User not found" };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { success: false, error: "Incorrect current password" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Change Password Error:", error);
    return { success: false, error: "Failed to update password" };
  }
}
