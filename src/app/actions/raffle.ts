"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

export async function spinStandardRaffle() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = (session.user as any).id;

  // 1. Calculate current points
  const transactions = await prisma.pointTransaction.findMany({
    where: { userId, status: "COMPLETED" }
  });
  const totalPoints = transactions.reduce((sum, t) => sum + t.amount, 0);

  // 1000 points per ticket
  if (totalPoints < 1000) {
    return { success: false, error: "Insufficient Kinetic Points (Need 1,000 PTS)" };
  }

  // 2. Determine prize
  // Outcomes: 500, NO WIN, 200, 1000
  // Probability: 20% 500, 40% NO WIN, 30% 200, 10% 1000
  const rng = Math.random();
  let prizeLabel = "";
  let prizePoints = 0;
  let stopAngle = 0; // Angles for the specific CSS slices

  if (rng < 0.2) {
    prizeLabel = "500 PTS";
    prizePoints = 500;
    stopAngle = 45; // Land on segment 1
  } else if (rng < 0.6) {
    prizeLabel = "NO WIN";
    prizePoints = 0;
    stopAngle = 135; // Land on segment 2
  } else if (rng < 0.9) {
    prizeLabel = "200 PTS";
    prizePoints = 200;
    stopAngle = 225; // Land on segment 3
  } else {
    prizeLabel = "1000 PTS";
    prizePoints = 1000;
    stopAngle = 315; // Land on segment 4
  }

  // 3. Record Transactions
  await prisma.$transaction([
    // Deduct entry fee
    prisma.pointTransaction.create({
      data: {
        userId,
        amount: -1000,
        type: "REDEMPTION",
        description: "Standard Raffle Spin Entry"
      }
    }),
    // Credit prize if any
    ...(prizePoints > 0 ? [
      prisma.pointTransaction.create({
        data: {
          userId,
          amount: prizePoints,
          type: "REDEMPTION",
          description: `Standard Raffle Win: ${prizeLabel}`
        }
      })
    ] : [])
  ]);

  revalidatePath("/agent/raffle");
  return { success: true, prize: prizeLabel, angle: stopAngle, points: prizePoints };
}

export async function spinGrandRaffle() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = (session.user as any).id;

  // For Grand Raffle, let's say it costs 5000 points per spin
  const transactions = await prisma.pointTransaction.findMany({
    where: { userId, status: "COMPLETED" }
  });
  const totalPoints = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (totalPoints < 5000) {
    return { success: false, error: "Insufficient Kinetic Points (Need 5,000 PTS for Grand Arena)" };
  }

  // Outcomes: iPhone 15+, 10k GCash, 1k Chips, 200 GCash
  const rng = Math.random();
  let prizeLabel = "";
  let stopAngle = 0;

  // iPhone 15+ (0.1%), 10k GCash (1%), 1k Chips (18.9%), 200 GCash (80%)
  if (rng < 0.001) {
    prizeLabel = "iPhone 15+";
    stopAngle = 0; // Top
  } else if (rng < 0.011) {
    prizeLabel = "10k GCash";
    stopAngle = 90; // Right
  } else if (rng < 0.2) {
    prizeLabel = "1k Chips";
    stopAngle = 180; // Bottom
  } else {
    prizeLabel = "200 GCash";
    stopAngle = 270; // Left
  }

  // Record transaction
  await prisma.pointTransaction.create({
    data: {
      userId,
      amount: -5000,
      type: "REDEMPTION",
      description: `Grand Raffle Spin Entry - Won ${prizeLabel}`
    }
  });

  revalidatePath("/agent/raffle");
  return { success: true, prize: prizeLabel, angle: stopAngle };
}
