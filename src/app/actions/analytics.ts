"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function recordVisit(path: string) {
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0] || headerList.get("x-real-ip") || "127.0.0.1";
    
    await prisma.visitorStat.create({
      data: {
        ip,
        path
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Failed to record visit:", error);
    return { success: false };
  }
}

export async function getGrowthAnalytics() {
  try {
    // Last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);

    const [visits, kycs] = await Promise.all([
      prisma.visitorStat.findMany({
        where: {
          timestamp: { gte: startDate }
        },
        orderBy: { timestamp: 'asc' }
      }),
      prisma.user.findMany({
        where: {
          kycSubmittedAt: { gte: startDate }
        },
        orderBy: { kycSubmittedAt: 'asc' }
      })
    ]);

    // Group by Date (YYYY-MM-DD)
    const analyticsMap: Record<string, { date: string, visits: number, kycs: number }> = {};
    
    // Initialize all 30 days with zero
    for (let i = 0; i < 30; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      analyticsMap[dateStr] = { 
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        visits: 0, 
        kycs: 0 
      };
    }

    // Fill visits
    visits.forEach(v => {
      const dateKey = v.timestamp.toISOString().split('T')[0];
      if (analyticsMap[dateKey]) {
        analyticsMap[dateKey].visits++;
      }
    });

    // Fill KYCs
    kycs.forEach(u => {
      if (u.kycSubmittedAt) {
        const dateKey = u.kycSubmittedAt.toISOString().split('T')[0];
        if (analyticsMap[dateKey]) {
          analyticsMap[dateKey].kycs++;
        }
      }
    });

    return { 
      success: true, 
      data: Object.values(analyticsMap).sort((a, b) => {
        // Simple sort by day index isn't needed here as we initialized sequentially
        return 0; 
      }) 
    };
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return { success: false, data: [] };
  }
}

export async function getLiveInsights() {
  try {
    const [totalVolume, activeNodes, linkedPlatforms] = await Promise.all([
      prisma.pointTransaction.aggregate({
        _sum: { amount: true },
        where: { type: { not: 'REDEMPTION' } }
      }),
      prisma.user.count({ where: { role: 'AGENT', kycStatus: 'APPROVED' } }),
      prisma.platformAccess.count({ where: { status: 'APPROVED' } })
    ]);

    return {
      success: true,
      data: {
        totalVolume: totalVolume._sum.amount || 0,
        activeNodes: activeNodes,
        linkedPlatforms: linkedPlatforms
      }
    };
  } catch (error) {
    console.error("Failed to fetch live insights:", error);
    return {
      success: false,
      data: { totalVolume: 0, activeNodes: 0, linkedPlatforms: 0 }
    };
  }
}

export async function getVisitorGrowth() {
  try {
    const stats = await prisma.visitorStat.findMany({
      where: { timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      orderBy: { timestamp: 'asc' }
    });
    return stats;
  } catch (error) {
    return [];
  }
}

export async function getKycSignupGrowth() {
  try {
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });
    return users;
  } catch (error) {
    return [];
  }
}
