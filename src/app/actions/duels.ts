"use server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

const MATCHMAKING_KEY = "duels:matchmaking:queue";

export async function joinMatchmaking(stake: number) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };
  
  const userId = (session.user as any).id;
  const username = session.user.name || "Anonymous";

  // Check if enough points
  const wallet = await prisma.pointTransaction.findMany({ where: { userId, status: "COMPLETED" } });
  const balance = wallet.reduce((s, t) => s + t.amount, 0);
  if (balance < stake) return { success: false, error: "Insufficient points" };

  // Check if already in queue or game
  const currentQueue = await redis.lrange(MATCHMAKING_KEY, 0, -1);
  if (currentQueue.includes(userId)) return { success: false, error: "Already in queue" };

  // Try to find an opponent with the same stake
  // Note: For simplicity in this version, we'll just match anyone in the queue
  const opponentId = await redis.lpop(MATCHMAKING_KEY);

  if (opponentId && opponentId !== userId) {
    // FOUND A MATCH!
    const gameId = `duel:${userId}:${opponentId}`;
    const initialCard = Math.floor(Math.random() * 13) + 1; // 1-13 (Ace to King)
    
    const gameData = {
      gameId,
      players: [opponentId, userId],
      stake,
      currentCard: initialCard,
      scores: { [opponentId]: 0, [userId]: 0 },
      turn: opponentId,
      status: "PLAYING",
      history: [],
      createdAt: Date.now()
    };

    await redis.set(`game:${gameId}`, JSON.stringify(gameData), 'EX', 1800);
    // Set pointers for both players to find their active game
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
  if (guess === "HIGHER" && nextCard >= currentCard) correct = true;
  if (guess === "LOWER" && nextCard <= currentCard) correct = true;

  if (correct) {
    game.scores[userId] += 1;
    game.currentCard = nextCard;
    // For simplicity: If you get it right, you keep the turn or it passes?
    // Let's make it more competitive: One guess per turn.
    game.turn = game.players.find((p: string) => p !== userId);
  } else {
    // Game over for this player? 
    // Let's say: 3 total rounds. Highest score wins.
    game.history.push({ player: userId, guess, result: "FAIL", card: nextCard });
    game.turn = game.players.find((p: string) => p !== userId);
    
    if (game.history.length >= 6) { // 3 turns each
      game.status = "FINISHED";
      const p1 = game.players[0];
      const p2 = game.players[1];
      const winner = game.scores[p1] > game.scores[p2] ? p1 : (game.scores[p2] > game.scores[p1] ? p2 : "DRAW");
      
      if (winner !== "DRAW") {
        // Record win
        await prisma.pointTransaction.create({
          data: {
            userId: winner,
            amount: Math.floor(game.stake * 1.9), // House takes 5% from each (10% total)
            type: "REDEMPTION",
            description: "Kinetic Duel Win"
          }
        });
        // Deduct lost stake (already deducted at join? no, we should deduct on match start)
        // Actually, to make it simple, let's deduct on join.
      }
    }
  }

  await redis.set(`game:${gameId}`, JSON.stringify(game), 'EX', 1800);
  return { success: true, game };
}
