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
  // Default Probability: 20% 500, 40% NO WIN, 30% 200, 10% 1000
  const settings = await prisma.systemSetting.findMany({
    where: { key: { startsWith: "raffle_standard_" } }
  });

  const getProb = (key: string, def: number) => {
    const s = settings.find(x => x.key === key);
    return s ? parseFloat(s.value) / 100 : def;
  };

  const prob500 = getProb("raffle_standard_500", 0.2);
  const probNoWin = getProb("raffle_standard_nowin", 0.4);
  const prob200 = getProb("raffle_standard_200", 0.3);
  const prob1000 = getProb("raffle_standard_1000", 0.1);

  const rng = Math.random();
  let prizeLabel = "";
  let prizePoints = 0;
  let stopAngle = 0;

  if (rng < prob500) {
    prizeLabel = "500 PTS";
    prizePoints = 500;
    stopAngle = 315;
  } else if (rng < prob500 + probNoWin) {
    prizeLabel = "NO WIN";
    prizePoints = 0;
    stopAngle = 45;
  } else if (rng < prob500 + probNoWin + prob200) {
    prizeLabel = "200 PTS";
    prizePoints = 200;
    stopAngle = 225;
  } else {
    prizeLabel = "1000 PTS";
    prizePoints = 1000;
    stopAngle = 135;
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
  const settings = await prisma.systemSetting.findMany({
    where: { key: { startsWith: "raffle_grand_" } }
  });

  const getProb = (key: string, def: number) => {
    const s = settings.find(x => x.key === key);
    return s ? parseFloat(s.value) / 100 : def;
  };

  const pIphone = getProb("raffle_grand_iphone", 0.001);
  const p10k = getProb("raffle_grand_10kgcash", 0.01);
  const p1k = getProb("raffle_grand_1kchips", 0.189);
  const p200 = getProb("raffle_grand_200gcash", 0.8);

  const rng = Math.random();
  let prizeLabel = "";
  let stopAngle = 0;

  // Probability distribution based on explicit totals
  if (rng < pIphone) {
    prizeLabel = "iPhone 15+";
    stopAngle = 0; // Top
  } else if (rng < pIphone + p10k) {
    prizeLabel = "10k GCash";
    stopAngle = 90; // Right
  } else if (rng < pIphone + p10k + p1k) {
    prizeLabel = "1k Chips";
    stopAngle = 180; // Bottom
  } else if (rng < pIphone + p10k + p1k + p200) {
    prizeLabel = "200 GCash";
    stopAngle = 270; // Left
  } else {
    // Fallback if total < 1.0 (though ideally it should be 1.0)
    prizeLabel = "200 GCash";
    stopAngle = 270;
  }

  // Record transaction
  const winTransactions = [];
  if (prizeLabel === "10k GCash") {
    winTransactions.push({
      userId,
      amount: 10000,
      currency: "GCASH",
      type: "REDEMPTION",
      description: "Grand Raffle Win: 10k GCash"
    });
  } else if (prizeLabel === "200 GCash") {
    winTransactions.push({
      userId,
      amount: 200,
      currency: "GCASH",
      type: "REDEMPTION",
      description: "Grand Raffle Win: 200 GCash"
    });
  } else if (prizeLabel === "1k Chips") {
    winTransactions.push({
      userId,
      amount: 1000,
      currency: "PTS",
      type: "REDEMPTION",
      description: "Grand Raffle Win: 1k Chips"
    });
  }

  await prisma.$transaction([
    prisma.pointTransaction.create({
      data: {
        userId,
        amount: -5000,
        type: "REDEMPTION",
        description: `Grand Raffle Spin Entry - Won ${prizeLabel}`
      }
    }),
    ...winTransactions.map(tx => prisma.pointTransaction.create({ data: tx as any }))
  ]);

  revalidatePath("/agent/raffle");
  return { success: true, prize: prizeLabel, angle: stopAngle };
}
