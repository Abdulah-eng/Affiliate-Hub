"use server";

import { prisma } from "@/lib/prisma";

export async function getLiveInsights() {
  try {
    // Total Point Economy Size
    const totalTransactions = await prisma.pointTransaction.aggregate({
      _sum: { amount: true },
      where: { 
        status: "COMPLETED",
        type: { not: "WITHDRAWAL_HOLD" } // Ensure we don't count holds
      }
    });

    // Active Agent Count
    const activeAgents = await prisma.user.count({
      where: { role: "AGENT", kycStatus: "APPROVED" }
    });

    // Brand provision rate 
    const platformCount = await prisma.platformAccess.count();

    return {
      success: true,
      data: {
        totalVolume: totalTransactions._sum.amount || 0,
        activeNodes: activeAgents,
        linkedPlatforms: platformCount
      }
    };
  } catch (error) {
    console.error("Live Insights Error:", error);
    return { success: false, error: "Failed to load live data." };
  }
}
