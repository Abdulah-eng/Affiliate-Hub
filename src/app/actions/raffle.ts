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
    where: { userId, status: "COMPLETED", currency: "PTS" }
  });
  const totalPoints = transactions.reduce((sum, t) => sum + t.amount, 0);

  // 1000 points per ticket
  if (totalPoints < 1000) {
    return { success: false, error: "Insufficient Kinetic Points (Need 1,000 PTS)" };
  }

  // 2. Determine prize
  const allSettings = await prisma.systemSetting.findMany({
    where: { key: { in: [
      "raffle_standard_500", "raffle_standard_nowin", "raffle_standard_200", "raffle_standard_1000",
      "CMS_RAFFLE_STANDARD_PRIZES"
    ] } }
  });

  const getProb = (key: string, def: number) => {
    const s = allSettings.find(x => x.key === key);
    return s ? parseFloat(s.value) / 100 : def;
  };

  // Prizes mapping
  let prizes = [
    { label: "500 PTS", type: "POINTS", val: 500, angle: 315 },
    { label: "NO WIN", type: "POINTS", val: 0, angle: 45 },
    { label: "200 PTS", type: "POINTS", val: 200, angle: 225 },
    { label: "1000 PTS", type: "POINTS", val: 1000, angle: 135 },
  ];

  try {
    const customPrizes = allSettings.find(x => x.key === "CMS_RAFFLE_STANDARD_PRIZES");
    if (customPrizes) {
      const parsed = JSON.parse(customPrizes.value);
      if (Array.isArray(parsed) && parsed.length === 4) {
        prizes = parsed.map((p, i) => ({ ...p, angle: prizes[i].angle }));
      }
    }
  } catch {}

  const prob500 = getProb("raffle_standard_500", 0.2);
  const probNoWin = getProb("raffle_standard_nowin", 0.4);
  const prob200 = getProb("raffle_standard_200", 0.3);
  const prob1000 = getProb("raffle_standard_1000", 0.1);

  const rng = Math.random();
  let winIdx = 0;

  if (rng < prob500) winIdx = 0;
  else if (rng < prob500 + probNoWin) winIdx = 1;
  else if (rng < prob500 + probNoWin + prob200) winIdx = 2;
  else winIdx = 3;

  const winner = prizes[winIdx];

  // 3. Record Transactions
  await prisma.$transaction([
    prisma.pointTransaction.create({
      data: {
        userId,
        amount: -1000,
        type: "REDEMPTION",
        description: "Standard Raffle Spin Entry"
      }
    }),
    ...(winner.val > 0 || winner.type === "MANUAL" ? [
      prisma.pointTransaction.create({
        data: {
          userId,
          amount: winner.type === "POINTS" ? winner.val : 0,
          currency: winner.type === "GCASH" ? "GCASH" : "PTS",
          type: "RAFFLE_WIN",
          status: winner.type === "MANUAL" ? "PENDING" : "COMPLETED",
          description: `Standard Raffle Win: ${winner.label}`
        }
      })
    ] : [])
  ]);

  revalidatePath("/agent/raffle");
  revalidatePath("/agent", "layout");
  return { success: true, prize: winner.label, angle: winner.angle, points: winner.type === "POINTS" ? winner.val : 0 };
}

export async function spinGrandRaffle() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = (session.user as any).id;

  const transactions = await prisma.pointTransaction.findMany({
    where: { userId, status: "COMPLETED", currency: "PTS" }
  });
  const totalPoints = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (totalPoints < 5000) {
    return { success: false, error: "Insufficient Kinetic Points (Need 5,000 PTS for Grand Arena)" };
  }

  const allSettings = await prisma.systemSetting.findMany({
    where: { key: { in: [
      "raffle_grand_iphone", "raffle_grand_10kgcash", "raffle_grand_1kchips", "raffle_grand_200gcash",
      "CMS_RAFFLE_GRAND_PRIZES"
    ] } }
  });

  const getProb = (key: string, def: number) => {
    const s = allSettings.find(x => x.key === key);
    return s ? parseFloat(s.value) / 100 : def;
  };

  let prizes = [
    { label: "iPhone 15+", type: "MANUAL", val: 0, angle: 0 },
    { label: "10k GCash", type: "GCASH", val: 10000, angle: 90 },
    { label: "1k Chips", type: "POINTS", val: 1000, angle: 180 },
    { label: "200 GCash", type: "GCASH", val: 200, angle: 270 },
  ];

  try {
    const customPrizes = allSettings.find(x => x.key === "CMS_RAFFLE_GRAND_PRIZES");
    if (customPrizes) {
      const parsed = JSON.parse(customPrizes.value);
      if (Array.isArray(parsed) && parsed.length === 4) {
        prizes = parsed.map((p, i) => ({ ...p, angle: prizes[i].angle }));
      }
    }
  } catch {}

  const pIphone = getProb("raffle_grand_iphone", 0.001);
  const p10k = getProb("raffle_grand_10kgcash", 0.01);
  const p1k = getProb("raffle_grand_1kchips", 0.189);
  const p200 = getProb("raffle_grand_200gcash", 0.8);

  const rng = Math.random();
  let winIdx = 0;

  if (rng < pIphone) winIdx = 0;
  else if (rng < pIphone + p10k) winIdx = 1;
  else if (rng < pIphone + p10k + p1k) winIdx = 2;
  else winIdx = 3;

  const winner = prizes[winIdx];

  // Record transaction
  const winTransactions = [];
  if (winner.val > 0 || winner.type === "MANUAL") {
    winTransactions.push({
      userId,
      amount: (winner.type === "POINTS" || winner.type === "GCASH") ? winner.val : 0,
      currency: winner.type === "GCASH" ? "GCASH" : "PTS",
      type: "RAFFLE_WIN",
      status: winner.type === "MANUAL" ? "PENDING" : "COMPLETED",
      description: `Grand Raffle Win: ${winner.label}`
    });
  }

  await prisma.$transaction([
    prisma.pointTransaction.create({
      data: {
        userId,
        amount: -5000,
        type: "REDEMPTION",
        description: `Grand Raffle Spin Entry - Won ${winner.label}`
      }
    }),
    ...winTransactions.map(tx => prisma.pointTransaction.create({ data: tx as any }))
  ]);

  revalidatePath("/agent/raffle");
  revalidatePath("/agent", "layout");
  return { success: true, prize: winner.label, angle: winner.angle };
}
