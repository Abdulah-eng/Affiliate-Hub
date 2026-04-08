"use server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

const ALLIANCE_QUEUE_KEY = "alliance:queue";

// Derive who should play this round
// Round r (1-indexed):  teamIdx = (r-1)%2,  playerInTeam = floor((r-1)/2)%2
function getActiveTurnInfo(game: any) {
  const r = game.round;
  const teamIdx = (r - 1) % 2;
  const playerIdx = Math.floor((r - 1) / 2) % 2;
  const playerId: string = game.teams[teamIdx][playerIdx];
  return { teamIdx, playerIdx, playerId };
}

export async function joinAllianceQueue(stake: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };
  const userId = (session.user as any).id;

  // Balance check
  const txs = await prisma.pointTransaction.findMany({ where: { userId, status: "COMPLETED" } });
  const balance = txs.reduce((s, t) => s + t.amount, 0);
  if (balance < stake) return { success: false, error: "Insufficient Kinetic Points" };

  // Already in active game?
  const activeId = await redis.get(`active_alliance:${userId}`);
  if (activeId) return { success: false, error: "Already in an active game" };

  // Already in queue?
  const queue = await redis.lrange(ALLIANCE_QUEUE_KEY, 0, -1);
  for (const entry of queue) {
    try { if (JSON.parse(entry).userId === userId) return { success: false, error: "Already in queue" }; } catch {}
  }

  // Add to queue
  await redis.rpush(ALLIANCE_QUEUE_KEY, JSON.stringify({ userId, stake, joinedAt: Date.now() }));

  // Check if we now have 4 players — if so, form a game
  const updated = await redis.lrange(ALLIANCE_QUEUE_KEY, 0, -1);
  if (updated.length >= 4) {
    const fourEntries: any[] = [];
    for (let i = 0; i < 4; i++) {
      const entry = await redis.lpop(ALLIANCE_QUEUE_KEY);
      if (!entry) return { success: true, status: "queued" }; // race condition guard
      try { fourEntries.push(JSON.parse(entry)); } catch {}
    }
    if (fourEntries.length < 4) return { success: true, status: "queued" };

    const gameId = `alliance:${Date.now()}`;
    const teams = [
      [fourEntries[0].userId, fourEntries[1].userId],
      [fourEntries[2].userId, fourEntries[3].userId],
    ];
    const initialCard = Math.floor(Math.random() * 13) + 1;

    const game = {
      gameId,
      teams,
      playerStake: stake,
      round: 1,
      maxRounds: 8,
      scores: { team0: 0, team1: 0 },
      currentCard: initialCard,
      status: "PLAYING",
      history: [] as any[],
      createdAt: Date.now(),
    };

    // Deduct stakes
    await prisma.$transaction(
      fourEntries.map(e =>
        prisma.pointTransaction.create({
          data: { userId: e.userId, amount: -stake, type: "REDEMPTION", description: "Kinetic Alliance: Stake" },
        })
      )
    );

    await redis.set(`alliance:game:${gameId}`, JSON.stringify(game), "EX", 3600);
    for (const e of fourEntries) {
      await redis.set(`active_alliance:${e.userId}`, gameId, "EX", 3600);
    }

    return { success: true, status: "game_started", gameId };
  }

  return { success: true, status: "queued" };
}

export async function getActiveAlliance() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as any).id;

  const gameId = await redis.get(`active_alliance:${userId}`);
  if (!gameId) return null;
  const raw = await redis.get(`alliance:game:${gameId}`);
  if (!raw) return null;
  const game = JSON.parse(raw);
  // Attach whose turn it is
  const turn = getActiveTurnInfo(game);
  return { ...game, activeTurn: turn };
}

export async function playAllianceTurn(guess: "HIGHER" | "LOWER") {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };
  const userId = (session.user as any).id;

  const gameId = await redis.get(`active_alliance:${userId}`);
  if (!gameId) return { success: false, error: "No active game" };

  const raw = await redis.get(`alliance:game:${gameId}`);
  if (!raw) return { success: false, error: "Game not found" };
  const game = JSON.parse(raw);

  if (game.status !== "PLAYING") return { success: false, error: "Game is over" };

  const { teamIdx, playerId } = getActiveTurnInfo(game);
  if (playerId !== userId) return { success: false, error: "Not your turn" };

  const nextCard = Math.floor(Math.random() * 13) + 1;
  const currentCard = game.currentCard;

  let correct = false;
  if (guess === "HIGHER" && nextCard > currentCard) correct = true;
  if (guess === "LOWER" && nextCard < currentCard) correct = true;

  const teamKey = `team${teamIdx}` as "team0" | "team1";
  if (correct) game.scores[teamKey]++;

  game.history.push({
    round: game.round,
    playerId,
    teamIdx,
    guess,
    currentCard,
    nextCard,
    correct,
  });

  game.currentCard = nextCard;
  game.round++;

  if (game.round > game.maxRounds) {
    game.status = "FINISHED";
    const winningTeamIdx = game.scores.team0 > game.scores.team1 ? 0
                         : game.scores.team1 > game.scores.team0 ? 1
                         : -1;

    if (winningTeamIdx !== -1) {
      const winners: string[] = game.teams[winningTeamIdx];
      await prisma.$transaction(
        winners.map((uid: string) =>
          prisma.pointTransaction.create({
            data: { userId: uid, amount: Math.floor(game.playerStake * 1.9), type: "REDEMPTION", description: "Kinetic Alliance: Win" },
          })
        )
      );
    } else {
      // Draw — refund all
      const all: string[] = [...game.teams[0], ...game.teams[1]];
      await prisma.$transaction(
        all.map((uid: string) =>
          prisma.pointTransaction.create({
            data: { userId: uid, amount: game.playerStake, type: "REDEMPTION", description: "Kinetic Alliance: Draw Refund" },
          })
        )
      );
    }
    // Cleanup
    for (const team of game.teams) {
      for (const uid of team as string[]) await redis.del(`active_alliance:${uid}`);
    }
  }

  await redis.set(`alliance:game:${gameId}`, JSON.stringify(game), "EX", 3600);
  revalidatePath("/agent/alliance");
  const turn = game.status === "PLAYING" ? getActiveTurnInfo(game) : null;
  return { success: true, game: { ...game, activeTurn: turn }, correct };
}

export async function leaveAllianceQueue() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false };
  const userId = (session.user as any).id;
  const queue = await redis.lrange(ALLIANCE_QUEUE_KEY, 0, -1);
  for (const entry of queue) {
    try {
      if (JSON.parse(entry).userId === userId) { await redis.lrem(ALLIANCE_QUEUE_KEY, 0, entry); break; }
    } catch {}
  }
  return { success: true };
}
