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
    if (data.id) {
      await prisma.leaderboardEntry.update({
        where: { id: data.id },
        data: {
          category: data.category,
          rank: data.rank,
          userId: data.userId,
          ggrValue: data.ggrValue,
          dateRange: data.dateRange
        }
      });
    } else {
      await prisma.leaderboardEntry.create({
        data: {
          category: data.category,
          rank: data.rank,
          userId: data.userId,
          ggrValue: data.ggrValue,
          dateRange: data.dateRange
        }
      });
    }
    revalidatePath("/admin/leaderboard");
    revalidatePath("/agent/leaderboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to save entry" };
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
