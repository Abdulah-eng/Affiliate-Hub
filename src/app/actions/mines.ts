"use server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

/**
 * Multiplier calculation logic
 * Based on house edge (roughly 3%)
 */
function calculateMultiplier(tilesClicked: number, totalMines: number) {
  const totalTiles = 25;
  let multiplier = 1.0;
  
  for (let i = 0; i < tilesClicked; i++) {
    // Current probability of hitting a gem
    const gemsLeft = (totalTiles - totalMines) - i;
    const totalLeft = totalTiles - i;
    const probability = gemsLeft / totalLeft;
    
    // House edge (0.97)
    multiplier = multiplier * (1 / probability) * 0.97;
  }
  
  return parseFloat(multiplier.toFixed(2));
}

export async function startMinesGame(betAmount: number, mineCount: number) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };
  if (betAmount <= 0) return { success: false, error: "Invalid bet amount" };
  if (mineCount < 1 || mineCount > 24) return { success: false, error: "Invalid mine count" };

  const userId = (session.user as any).id;

  // 1. Check points
  const transactions = await prisma.pointTransaction.findMany({
    where: { userId, status: "COMPLETED", currency: "PTS" }
  });
  const totalPoints = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (totalPoints < betAmount) {
    return { success: false, error: "Insufficient Kinetic Points" };
  }

  // 2. Generate board (Indices 0-24)
  const board = new Array(25).fill(false); // false = gem
  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    const idx = Math.floor(Math.random() * 25);
    if (!board[idx]) {
      board[idx] = true; // true = mine
      minesPlaced++;
    }
  }

  // 3. Store in Redis
  const gameKey = `mines:${userId}`;
  await redis.set(gameKey, JSON.stringify({
    betAmount,
    mineCount,
    board,
    revealed: [],
    active: true
  }), 'EX', 3600); // 1 hour expiry

  // 4. Deduct bet
  await prisma.pointTransaction.create({
    data: {
      userId,
      amount: -betAmount,
      type: "REDEMPTION",
      description: "Kinetic Mines: Bet Placement"
    }
  });

  revalidatePath("/agent/mines");
  revalidatePath("/agent", "layout");
  return { success: true };
}

export async function revealMinesTile(tileIndex: number) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  const userId = (session.user as any).id;
  const gameKey = `mines:${userId}`;
  const gameData = await redis.get(gameKey);

  if (!gameData) return { success: false, error: "No active game" };
  const game = JSON.parse(gameData);

  if (!game.active) return { success: false, error: "Game already finished" };
  if (game.revealed.includes(tileIndex)) return { success: false, error: "Tile already revealed" };

  // Check if hit mine
  const isMine = game.board[tileIndex];
  game.revealed.push(tileIndex);

  if (isMine) {
    // Game Over - Lost
    game.active = false;
    await redis.set(gameKey, JSON.stringify(game), 'EX', 300); // Keep for 5 mins to show result
    return { success: true, status: "LOST", revealed: game.revealed, board: game.board };
  } else {
    // Gem revealed
    const multiplier = calculateMultiplier(game.revealed.length, game.mineCount);
    await redis.set(gameKey, JSON.stringify(game), 'EX', 3600);
    return { success: true, status: "CONTINUE", revealed: game.revealed, multiplier };
  }
}

export async function cashOutMines() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  const userId = (session.user as any).id;
  const gameKey = `mines:${userId}`;
  const gameData = await redis.get(gameKey);

  if (!gameData) return { success: false, error: "No active game" };
  const game = JSON.parse(gameData);

  if (!game.active) return { success: false, error: "Game already finished" };
  if (game.revealed.length === 0) return { success: false, error: "Must reveal at least one tile" };

  const multiplier = calculateMultiplier(game.revealed.length, game.mineCount);
  const winAmount = Math.floor(game.betAmount * multiplier);

  // Mark inactive
  game.active = false;
  await redis.set(gameKey, JSON.stringify(game), 'EX', 300);

  // Credit points
  await prisma.pointTransaction.create({
    data: {
      userId,
      amount: winAmount,
      type: "REDEMPTION",
      description: `Kinetic Mines: Cash Out @ ${multiplier}x`
    }
  });

  revalidatePath("/agent/mines");
  revalidatePath("/agent", "layout");
  return { success: true, winAmount, multiplier };
}
