"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function requestWithdrawal(amount: number, paymentMethod: string, paymentDetails: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  if (amount < 100) return { success: false, error: "Minimum withdrawal is 100 PTS" };

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Calculate current points balance accurately
      const transactions = await tx.pointTransaction.findMany({
        where: { userId: session.user.id }
      });
      // We assume REDEMPTION holds or subtracts, or WITHDRAWAL_HOLD subtracts.
      // Easiest is just sum amounts of COMPLETED or PENDING.
      // Wait, if amount is negative, summing is fine. But schema says amount Int, usually positive.
      // Let's check how point economy assumes it. 
      // Current PointTransaction: type REDEMPTION or WITHDRAWAL_HOLD. 
      // If we use positive amounts but deduct based on type:
      let balance = 0;
      for (const t of transactions) {
        if (t.status === "REJECTED") continue;
        if (t.type === "WITHDRAWAL_HOLD" || t.type === "REDEMPTION") {
          balance -= t.amount;
        } else {
          balance += t.amount;
        }
      }

      if (balance < amount) {
        throw new Error("Insufficient point balance.");
      }

      // 2. Insert hold transaction
      await tx.pointTransaction.create({
        data: {
          userId: session.user.id,
          amount: amount,
          type: "WITHDRAWAL_HOLD",
          description: "Pending point withdrawal request",
          status: "PENDING"
        }
      });

      // 3. Insert withdrawal Request
      await tx.withdrawal.create({
        data: {
          userId: session.user.id,
          amount,
          paymentMethod,
          paymentDetails
        }
      });

      revalidatePath("/agent/wallet");
      return { success: true };
    });
  } catch (error: any) {
    console.error("Withdraw Request Error:", error);
    return { success: false, error: error.message || "Failed to submit withdrawal request." };
  }
}

export async function processWithdrawal(id: string, action: "APPROVED" | "REJECTED", notes?: string, proofUrl?: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    return await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.findUnique({
        where: { id },
        include: { user: true }
      });
      if (!withdrawal) throw new Error("Not found");
      if (withdrawal.status !== "PENDING") throw new Error("Already processed.");

      // Update withdrawal
      await tx.withdrawal.update({
        where: { id },
        data: {
          status: action,
          notes,
          proofUrl
        }
      });

      // Update associated WITHDRAWAL_HOLD transaction
      // Find the most recent pending HOLD transaction for this user of this exact amount.
      // In production, attaching transactionId to Withdrawal is best, but we will find it:
      const holdTrans = await tx.pointTransaction.findFirst({
        where: {
          userId: withdrawal.userId,
          amount: withdrawal.amount,
          type: "WITHDRAWAL_HOLD",
          status: "PENDING"
        },
        orderBy: { createdAt: "desc" }
      });

      if (holdTrans) {
         if (action === "REJECTED") {
             // We can mark it rejected so it doesn't count against balance
             await tx.pointTransaction.update({
                 where: { id: holdTrans.id },
                 data: { status: "REJECTED" }
             });
         } else {
             // Approved
             await tx.pointTransaction.update({
                 where: { id: holdTrans.id },
                 data: { status: "COMPLETED", description: "Withdrawal completed." }
             });
         }
      }

      // Notification logic
      let nTitle = action === "APPROVED" ? "Withdrawal Complete" : "Withdrawal Rejected";
      let nMessage = action === "APPROVED" 
        ? `Your request for ${withdrawal.amount} PTS to ${withdrawal.paymentMethod} has been successfully dispatched.`
        : `Your request was denied. ${notes ? notes : ''} Your points have been refunded.`;
      
      await tx.notification.create({
        data: {
          userId: withdrawal.userId,
          title: nTitle,
          message: nMessage,
          type: action === "APPROVED" ? "SUCCESS" : "ERROR"
        }
      });

      revalidatePath("/admin/payouts");
      return { success: true };
    });
  } catch (error: any) {
    console.error("Process Withdraw Error:", error);
    return { success: false, error: error.message || "Failed to process." };
  }
}

export async function getWithdrawalsAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;

  return prisma.withdrawal.findMany({
    include: {
      user: { select: { name: true, username: true, image: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}
export async function uploadPayoutProof(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "payouts");
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return { 
      success: true, 
      url: `/uploads/payouts/${filename}` 
    };
  } catch (error: any) {
    console.error("Upload Proof Error:", error);
    return { success: false, error: "Failed to upload file." };
  }
}
