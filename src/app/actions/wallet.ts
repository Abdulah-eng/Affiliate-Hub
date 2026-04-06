"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";

export async function getAgentWallet() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;

  const transactions = await prisma.pointTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  const totalPoints = transactions
    .filter(t => t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalPoints,
    transactions
  };
}

export async function getReferralStats() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      referrals: {
        select: { username: true, kycStatus: true, createdAt: true }
      }
    }
  });

  if (!user) return null;

  const verifiedReferrals = user.referrals.filter(r => r.kycStatus === "APPROVED").length;

  return {
    referralCode: user.referralCode,
    totalInvites: user.referrals.length,
    verifiedReferrals,
    referralsList: user.referrals
  };
}

// Admins only
export async function getPointsAuditLog() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;

  return prisma.pointTransaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, username: true } }
    }
  });
}

export async function flagTransactionForReview(transactionId: string) {
  await prisma.pointTransaction.update({
    where: { id: transactionId },
    data: { status: "FLAGGED" }
  });
  return { success: true };
}
