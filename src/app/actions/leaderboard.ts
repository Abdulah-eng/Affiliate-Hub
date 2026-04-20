"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function getLeaderboard() {
  try {
    const entries = await prisma.leaderboardEntry.findMany({
      orderBy: { rank: 'asc' }
    });
    return { success: true, entries };
  } catch (error) {
    return { success: false, error: "Failed to fetch leaderboard" };
  }
}

export async function upsertLeaderboardEntry(data: { id?: string, category: string, rank: number, userId: string, ggrValue: string, dateRange?: string }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    if (!data.userId || !data.ggrValue) {
      return { success: false, error: "User ID/Username and GGR value are required" };
    }

    // Lookup user by ID or Username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: data.userId },
          { username: data.userId },
          { affiliateUsername: data.userId }
        ]
      }
    });

    if (!user) {
      return { success: false, error: `User not found: ${data.userId}` };
    }

    // Check for existing entry for this rank and category
    const existingEntry = await prisma.leaderboardEntry.findFirst({
      where: {
        rank: data.rank,
        category: data.category
      }
    });

    if (existingEntry) {
      await prisma.leaderboardEntry.update({
        where: { id: existingEntry.id },
        data: {
          userId: user.id || user.username || data.userId, // Fallback to raw string if needed, but we look up user
          ggrValue: data.ggrValue,
          dateRange: data.dateRange || ""
        }
      });
    } else {
      await prisma.leaderboardEntry.create({
        data: {
          userId: user.id || user.username || data.userId,
          rank: data.rank,
          category: data.category,
          ggrValue: data.ggrValue,
          dateRange: data.dateRange || ""
        }
      });
    }

    revalidatePath("/admin/leaderboard");
    revalidatePath("/agent/leaderboard");
    return { success: true };
  } catch (error: any) {
    console.error("Leaderboard Save Error:", error);
    if (error.stack) console.error("Leaderboard Error Stack:", error.stack);
    return { success: false, error: "Failed to save entry: " + (error.message || "Unknown error") };
  }
}

export async function deleteLeaderboardEntry(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    await prisma.leaderboardEntry.delete({ where: { id } });
    revalidatePath("/admin/leaderboard");
    revalidatePath("/agent/leaderboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete entry" };
  }
}
