"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function getAgentWallet() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;

  const transactions = await prisma.pointTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  const settingsData = await prisma.systemSetting.findMany();
  const settings = settingsData.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);

  const totalPoints = transactions
    .filter(t => t.status === "COMPLETED" && t.currency === "PTS")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalGCash = transactions
    .filter(t => t.status === "COMPLETED" && t.currency === "GCASH")
    .reduce((sum, t) => sum + t.amount, 0);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mobileNumber: true }
  });

  return {
    totalPoints,
    totalGCash,
    transactions,
    mobileNumber: user?.mobileNumber || "",
    settings
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

  // Background sync: ensure referralCode matches username exactly
  let referralCode = user.referralCode;
  const targetCode = user.username || referralCode;
  if (referralCode !== targetCode && targetCode) {
    referralCode = targetCode;
    // Don't await to avoid blocking response, but update DB
    prisma.user.update({
      where: { id: session.user.id },
      data: { referralCode }
    }).catch(console.error);
  }

  const verifiedReferrals = user.referrals.filter(r => r.kycStatus === "APPROVED").length;

  return {
    referralCode, // Return the synced code
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
