"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function updateAgentProfile(data: { name: string, affiliateUsername: string, location: string, mobileNumber: string }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        affiliateUsername: data.affiliateUsername,
        location: data.location,
        mobileNumber: data.mobileNumber,
      }
    });
    return { success: true };
  } catch(e) {
    return { success: false, error: "Failed to update profile." };
  }
}

export async function redeemRewards() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  try {
    // Basic logic to award points or simulate a redemption
    await prisma.pointTransaction.create({
      data: {
        userId: session.user.id,
        amount: -100, // Deduct 100 points as a mock redemption
        type: "REDEMPTION",
        description: "Mock Agent Reward Redemption"
      }
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: "Validation failed, balance too low, or DB error." };
  }
}
export async function getAgentHeaderStats() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;

  const userId = session.user.id;

  try {
    const [transactions, totalTasks, completedTasks, activeNodes, user] = await Promise.all([
      prisma.pointTransaction.findMany({
        where: { userId, status: "COMPLETED", currency: "PTS" }
      }),
      prisma.task.count(),
      prisma.userTaskProgress.count({
        where: { userId, status: "COMPLETED" }
      }),
      prisma.platformAccess.count({
        where: { userId, status: "APPROVED" }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { kycStatus: true }
      })
    ]);

    const totalPoints = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Performance logic
    const ratio = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
    const performance = Math.round(ratio * 100);

    // Rank logic
    let rank = "Pending Vault";
    if (user?.kycStatus === "APPROVED") {
      if (totalPoints < 10000) rank = "Standard Tier";
      else if (totalPoints < 50000) rank = "Elite Tier";
      else rank = "Diamond Tier";
    }

    // Trend logic (mocked for UI but stable)
    const trend = "+5.2%";

    return {
      rank,
      performance,
      points: totalPoints,
      activeNodes,
      trend
    };
  } catch (error) {
    console.error("Header Stats Error:", error);
    return null;
  }
}
