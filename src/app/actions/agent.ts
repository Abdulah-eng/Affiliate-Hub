"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function updateAgentProfile(data: { name: string, affiliateUsername: string, location: string }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        affiliateUsername: data.affiliateUsername,
        location: data.location,
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
