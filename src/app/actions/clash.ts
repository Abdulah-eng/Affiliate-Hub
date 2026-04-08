"use server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

const CLASH_QUEUE_KEY = "clash:queue";

// ── Mask opponent's pick until both have submitted ──────────────────────────
function maskForPlayer(game: any, userId: string) {
  const masked = { ...game };
  const allPicked = game.players.every((p: string) => game.picks[p] !== null);
  if (!allPicked) {
    const picks: Record<string, any> = {};
    for (const p of game.players) {
      picks[p] = p === userId ? game.picks[p] : (game.picks[p] !== null ? "HIDDEN" : null);
    }
    masked.picks = picks;
  }
  return masked;
}

export async function joinClashQueue(stake: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };
  const userId = (session.user as any).id;

  // Balance check
  const txs = await prisma.pointTransaction.findMany({ where: { userId, status: "COMPLETED" } });
  const balance = txs.reduce((s, t) => s + t.amount, 0);
  if (balance < stake) return { success: false, error: "Insufficient Kinetic Points" };

  // Already in active game?
  const activeGameId = await redis.get(`active_clash:${userId}`);
  if (activeGameId) return { success: false, error: "You already have an active game" };

  // Already in queue?
  const queue = await redis.lrange(CLASH_QUEUE_KEY, 0, -1);
  for (const entry of queue) {
    try { if (JSON.parse(entry).userId === userId) return { success: false, error: "Already in queue" }; } catch {}
  }

  // Try to match with an existing queued opponent
  for (const entry of queue) {
    let opponent: any;
    try { opponent = JSON.parse(entry); } catch { continue; }
    if (opponent.userId === userId) continue;

    // Match found — remove opponent from queue
    await redis.lrem(CLASH_QUEUE_KEY, 1, entry);

    const gameId = `clash:${Date.now()}:${userId.slice(-4)}`;
    const game = {
      gameId,
      players: [opponent.userId, userId],
      stake,
      round: 1,
      maxRounds: 5,
      scores: { [opponent.userId]: 0, [userId]: 0 },
      picks: { [opponent.userId]: null as number | null, [userId]: null as number | null },
      lastTarget: null as number | null,
      lastRoundWinner: null as string | null,
      lastPicks: null as Record<string, number> | null,
      status: "PLAYING",
      history: [] as any[],
      createdAt: Date.now(),
    };

    // Deduct stakes atomically
    await prisma.$transaction([
      prisma.pointTransaction.create({ data: { userId, amount: -stake, type: "REDEMPTION", description: "Kinetic Clash: Stake" } }),
      prisma.pointTransaction.create({ data: { userId: opponent.userId, amount: -stake, type: "REDEMPTION", description: "Kinetic Clash: Stake" } }),
    ]);

    await redis.set(`clash:game:${gameId}`, JSON.stringify(game), "EX", 1800);
    await redis.set(`active_clash:${userId}`, gameId, "EX", 1800);
    await redis.set(`active_clash:${opponent.userId}`, gameId, "EX", 1800);

    return { success: true, matched: true, gameId };
  }

  // No match — enter queue
  await redis.rpush(CLASH_QUEUE_KEY, JSON.stringify({ userId, stake, joinedAt: Date.now() }));
  return { success: true, matched: false };
}

export async function getActiveClash() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as any).id;

  const gameId = await redis.get(`active_clash:${userId}`);
  if (!gameId) return null;
  const raw = await redis.get(`clash:game:${gameId}`);
  if (!raw) return null;
  return maskForPlayer(JSON.parse(raw), userId);
}

export async function submitClashPick(pick: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };
  const userId = (session.user as any).id;

  if (pick < 1 || pick > 10) return { success: false, error: "Pick must be 1–10" };

  const gameId = await redis.get(`active_clash:${userId}`);
  if (!gameId) return { success: false, error: "No active game" };

  const raw = await redis.get(`clash:game:${gameId}`);
  if (!raw) return { success: false, error: "Game not found" };
  const game = JSON.parse(raw);

  if (game.status !== "PLAYING") return { success: false, error: "Game is finished" };
  if (game.picks[userId] !== null) return { success: false, error: "Already submitted this round" };

  game.picks[userId] = pick;

  const [p1, p2] = game.players;
  const bothPicked = game.picks[p1] !== null && game.picks[p2] !== null;

  if (bothPicked) {
    // Generate secret target and resolve round
    const target = Math.floor(Math.random() * 10) + 1;
    const d1 = Math.abs(game.picks[p1] - target);
    const d2 = Math.abs(game.picks[p2] - target);

    let roundWinner: string | null = null;
    if (d1 < d2) { game.scores[p1]++; roundWinner = p1; }
    else if (d2 < d1) { game.scores[p2]++; roundWinner = p2; }
    // exact tie → no point

    game.history.push({ round: game.round, picks: { [p1]: game.picks[p1], [p2]: game.picks[p2] }, target, winner: roundWinner });
    game.lastTarget = target;
    game.lastRoundWinner = roundWinner;
    game.lastPicks = { [p1]: game.picks[p1], [p2]: game.picks[p2] };
    game.round++;
    game.picks = { [p1]: null, [p2]: null };

    if (game.round > game.maxRounds) {
      game.status = "FINISHED";
      const winner = game.scores[p1] > game.scores[p2] ? p1 : game.scores[p2] > game.scores[p1] ? p2 : "DRAW";

      if (winner !== "DRAW") {
        await prisma.pointTransaction.create({
          data: { userId: winner, amount: Math.floor(game.stake * 1.9), type: "REDEMPTION", description: `Kinetic Clash Win` },
        });
      } else {
        await prisma.$transaction([
          prisma.pointTransaction.create({ data: { userId: p1, amount: game.stake, type: "REDEMPTION", description: "Kinetic Clash: Draw Refund" } }),
          prisma.pointTransaction.create({ data: { userId: p2, amount: game.stake, type: "REDEMPTION", description: "Kinetic Clash: Draw Refund" } }),
        ]);
      }
      await redis.del(`active_clash:${p1}`);
      await redis.del(`active_clash:${p2}`);
    }
  }

  await redis.set(`clash:game:${gameId}`, JSON.stringify(game), "EX", 1800);
  revalidatePath("/agent/clash");
  return { success: true, game: maskForPlayer(game, userId) };
}

export async function leaveClashQueue() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false };
  const userId = (session.user as any).id;
  const queue = await redis.lrange(CLASH_QUEUE_KEY, 0, -1);
  for (const entry of queue) {
    try {
      if (JSON.parse(entry).userId === userId) { await redis.lrem(CLASH_QUEUE_KEY, 0, entry); break; }
    } catch {}
  }
  return { success: true };
}
