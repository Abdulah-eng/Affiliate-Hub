"use server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

const MATCHMAKING_KEY = "duels:matchmaking:queue";

export async function leaveMatchmaking() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false };
  const userId = (session.user as any).id;
  await redis.lrem(MATCHMAKING_KEY, 0, userId);
  return { success: true };
}

export async function joinMatchmaking(stake: number) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };
  
  const userId = (session.user as any).id;

  // Check if enough points
  const wallet = await prisma.pointTransaction.findMany({ where: { userId, status: "COMPLETED" } });
  const balance = wallet.reduce((s, t) => s + t.amount, 0);
  if (balance < stake) return { success: false, error: "Insufficient points" };

  // Check if already in queue
  const currentQueue = await redis.lrange(MATCHMAKING_KEY, 0, -1);
  if (currentQueue.includes(userId)) return { success: false, error: "Already in queue" };

  // Try to find an opponent
  const opponentId = await redis.lpop(MATCHMAKING_KEY);

  if (opponentId && opponentId !== userId) {
    // FOUND A MATCH! — Deduct stake from both players immediately
    const gameId = `duel:${Date.now()}:${userId}:${opponentId}`;
    const initialCard = Math.floor(Math.random() * 13) + 1;
    
    const gameData = {
      gameId,
      players: [opponentId, userId],
      stake,
      currentCard: initialCard,
      scores: { [opponentId]: 0, [userId]: 0 },
      turn: opponentId,
      status: "PLAYING",
      totalTurns: 0,
      maxTurns: 6, // 3 turns each player
      createdAt: Date.now()
    };

    // Deduct stakes from both players
    await prisma.$transaction([
      prisma.pointTransaction.create({
        data: {
          userId,
          amount: -stake,
          type: "REDEMPTION",
          description: `Kinetic Duel: Stake (Game ${gameId.slice(0, 12)})`
        }
      }),
      prisma.pointTransaction.create({
        data: {
          userId: opponentId,
          amount: -stake,
          type: "REDEMPTION",
          description: `Kinetic Duel: Stake (Game ${gameId.slice(0, 12)})`
        }
      })
    ]);

    await redis.set(`game:${gameId}`, JSON.stringify(gameData), 'EX', 1800);
    await redis.set(`active_game:${userId}`, gameId, 'EX', 1800);
    await redis.set(`active_game:${opponentId}`, gameId, 'EX', 1800);

    return { success: true, matched: true, gameId };
  } else {
    // No opponent found, enter queue
    await redis.rpush(MATCHMAKING_KEY, userId);
    return { success: true, matched: false };
  }
}

export async function getActiveDuel() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;
  const userId = (session.user as any).id;

  const gameId = await redis.get(`active_game:${userId}`);
  if (!gameId) return null;

  const gameData = await redis.get(`game:${gameId}`);
  return gameData ? JSON.parse(gameData) : null;
}

export async function playDuelTurn(gameId: string, guess: "HIGHER" | "LOWER") {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };
  
  const userId = (session.user as any).id;
  const gameData = await redis.get(`game:${gameId}`);
  if (!gameData) return { success: false, error: "Game not found" };

  const game = JSON.parse(gameData);
  if (game.status !== "PLAYING") return { success: false, error: "Game finished" };
  if (game.turn !== userId) return { success: false, error: "Not your turn" };

  const nextCard = Math.floor(Math.random() * 13) + 1;
  const currentCard = game.currentCard;
  
  let correct = false;
  if (guess === "HIGHER" && nextCard > currentCard) correct = true;
  if (guess === "LOWER" && nextCard < currentCard) correct = true;
  // Equal card: counts as wrong for both predictions

  if (correct) {
    game.scores[userId] += 1;
  }
  
  game.currentCard = nextCard;
  game.totalTurns = (game.totalTurns || 0) + 1;
  // Alternate turns
  game.turn = game.players.find((p: string) => p !== userId);

  // Check if game is over (maxTurns total)
  if (game.totalTurns >= (game.maxTurns || 6)) {
    game.status = "FINISHED";

    const p1 = game.players[0];
    const p2 = game.players[1];
    const winner = game.scores[p1] > game.scores[p2] ? p1 
                 : game.scores[p2] > game.scores[p1] ? p2 
                 : "DRAW";

    if (winner !== "DRAW") {
      // Credit winner with net pot (both stakes minus 5% house edge each)
      await prisma.pointTransaction.create({
        data: {
          userId: winner,
          amount: Math.floor(game.stake * 1.9),
          type: "REDEMPTION",
          description: `Kinetic Duel Win — ${game.scores[winner]} pts vs ${game.scores[game.players.find((p: string) => p !== winner)]} pts`
        }
      });
    } else {
      // Draw: refund both players
      await prisma.$transaction([
        prisma.pointTransaction.create({
          data: { userId: p1, amount: game.stake, type: "REDEMPTION", description: "Kinetic Duel: Draw Refund" }
        }),
        prisma.pointTransaction.create({
          data: { userId: p2, amount: game.stake, type: "REDEMPTION", description: "Kinetic Duel: Draw Refund" }
        })
      ]);
    }

    // Clean up active game pointers
    await redis.del(`active_game:${p1}`);
    await redis.del(`active_game:${p2}`);
  }

  await redis.set(`game:${gameId}`, JSON.stringify(game), 'EX', 1800);
  revalidatePath("/agent/duels");
  return { success: true, game, correct };
}
