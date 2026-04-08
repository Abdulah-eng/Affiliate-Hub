"use server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

const WHEEL_NUMBERS = [1, 12, 9, 4, 11, 8, 2, 13, 5, 10, 3, 7];
const TICKET_COST = 1000;

export async function startLuckGame() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  const userId = (session.user as any).id;

  // 1. Check points for 1 ticket
  const transactions = await prisma.pointTransaction.findMany({
    where: { userId, status: "COMPLETED" }
  });
  const totalPoints = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (totalPoints < TICKET_COST) {
    return { success: false, error: "Insufficient Kinetic Points (Need 1,000 PTS)" };
  }

  // 2. Deduct Ticket
  await prisma.pointTransaction.create({
    data: {
      userId,
      amount: -TICKET_COST,
      type: "REDEMPTION",
      description: "Push Your Luck: Ticket Entry"
    }
  });

  // 3. Initialize Game in Redis
  const gameKey = `luck:${userId}`;
  const initialNum = 6;
  await redis.set(gameKey, JSON.stringify({
    currentNum: initialNum,
    roundBank: 0,
    active: true,
    history: []
  }), 'EX', 1800);

  revalidatePath("/agent/raffle"); // Revalidate where points are shown
  return { success: true, initialNum };
}

export async function spinLuckWheel(guess: "HIGHER" | "LOWER") {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  const userId = (session.user as any).id;
  const gameKey = `luck:${userId}`;
  const gameData = await redis.get(gameKey);

  if (!gameData) return { success: false, error: "No active game" };
  const game = JSON.parse(gameData);

  if (!game.active) return { success: false, error: "Game finished. Start new session." };

  const prevNum = game.currentNum;
  const nextIndex = Math.floor(Math.random() * WHEEL_NUMBERS.length);
  const nextNum = WHEEL_NUMBERS[nextIndex];

  let isWin = false;
  if (guess === "HIGHER" && nextNum > prevNum) isWin = true;
  if (guess === "LOWER" && nextNum < prevNum) isWin = true;
  if (nextNum === prevNum) isWin = true; // Tie goes to player for better retention

  if (isWin) {
    // Round points grow exponentially or fixed increments
    // Let's do: 200 pts for first win, then +20% increments
    const baseIncrement = 250;
    const bonusMultiplier = 1 + (game.history.length * 0.1);
    const winIncrement = Math.floor(baseIncrement * bonusMultiplier);
    
    game.roundBank += winIncrement;
    game.currentNum = nextNum;
    game.history.push({ guess, result: nextNum, status: "WIN", win: winIncrement });
    
    await redis.set(gameKey, JSON.stringify(game), 'EX', 1800);
    return { success: true, status: "WIN", nextNum, roundBank: game.roundBank, angle: nextIndex * (360 / 12) };
  } else {
    // LOST - Case closed
    game.active = false;
    await redis.set(gameKey, JSON.stringify(game), 'EX', 300);
    return { success: true, status: "LOST", nextNum, angle: nextIndex * (360 / 12) };
  }
}

export async function bankLuckPoints() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  const userId = (session.user as any).id;
  const gameKey = `luck:${userId}`;
  const gameData = await redis.get(gameKey);

  if (!gameData) return { success: false, error: "No active game" };
  const game = JSON.parse(gameData);

  if (!game.active) return { success: false, error: "Game already finished" };
  if (game.roundBank === 0) return { success: false, error: "Nothing to bank" };

  const totalWon = game.roundBank;
  game.active = false;
  await redis.set(gameKey, JSON.stringify(game), 'EX', 300);

  // Credit Points
  await prisma.pointTransaction.create({
    data: {
      userId,
      amount: totalWon,
      type: "REDEMPTION",
      description: `Push Your Luck: Banked ${totalWon} PTS`
    }
  });

  revalidatePath("/agent/raffle");
  return { success: true, totalWon };
}
