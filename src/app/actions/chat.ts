"use server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { awardDailyTask } from "./gamification";

const CHAT_REDIS_KEY = "chat:recent_messages";
const MAX_CACHED_MESSAGES = 100;

export async function sendMessage(content: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { success: false, error: "Unauthorized" };
  }

  // Basic anti-spam: check last message time in Redis (With fallback if Redis fails)
  const lastMsgKey = `ratelimit:chat:${session.user.id}`;
  let lastMsgTime = null;
  try {
    lastMsgTime = await redis.get(lastMsgKey);
    if (lastMsgTime && (Date.now() - parseInt(lastMsgTime)) < 3000) {
      return { success: false, error: "Please wait before sending another message." };
    }
    await redis.set(lastMsgKey, Date.now().toString(), "PX", 3000); // 3 seconds cooldown
  } catch (e) {
    console.warn("Redis is unavailable for ratelimit, bypassing.", e);
  }

  // Fetch points from settings (Default to 10 if not found)
  let chatPoints = 10;
  try {
    const chatPointsSetting = await prisma.systemSetting.findUnique({ where: { key: "POINTS_CHAT" } });
    if (chatPointsSetting) {
      chatPoints = parseInt(chatPointsSetting.value) || 10;
    } else {
      // Fallback to legacy key from seed if exists
      const legacySetting = await prisma.systemSetting.findUnique({ where: { key: "points_per_chat" } });
      if (legacySetting) chatPoints = parseInt(legacySetting.value) || 10;
    }
  } catch (e) {
    console.error("Error fetching chat points setting:", e);
  }

  // --- SENTINEL V2 AI MODERATION FILTER ---
  try {
    const sentinelSetting = await prisma.systemSetting.findUnique({ where: { key: "SENTINEL_V2_ENABLED" }});
    if (sentinelSetting?.value === "true") {
      const flaggedWords = ["scam", "hack", "bot", "dump", "cheat", "exploit", "phish", "script"];
      const lowerContent = content.toLowerCase();
      if (flaggedWords.some(w => lowerContent.includes(w))) {
        // Punish agent quietly or generate alert
        await prisma.notification.create({
          data: {
            userId: session.user.id,
            title: "Sentinel V2 Alert",
            message: "Your recent network transmission was flagged for policy violation.",
            type: "ERROR"
          }
        });
        return { success: false, error: "Sentinel V2 Moderation: Message flagged as fraudulent." };
      }
    }
  } catch (e) {
    console.error("Sentinel Moderation Error:", e);
  }
  // --- END STRAT ---

  const newMessage = await prisma.chatMessage.create({
    data: {
      userId: session.user.id,
      content,
      rewardPoints: chatPoints,
      reactions: []
    },
    include: {
      user: {
        select: { name: true, username: true, role: true }
      }
    }
  });

  // Award First Chat of Day
  await awardDailyTask(session.user.id, "FIRST_CHAT", 100);

  // Automatically award points to Wallet
  await prisma.pointTransaction.create({
    data: {
      userId: session.user.id,
      amount: chatPoints,
      type: "CHAT",
      description: "Chat engagement reward"
    }
  });

  // Push to Redis Cache for fast retrieval (With Fallback)
  try {
    const messageData = JSON.stringify(newMessage);
    await redis.lpush(CHAT_REDIS_KEY, messageData);
    await redis.ltrim(CHAT_REDIS_KEY, 0, MAX_CACHED_MESSAGES - 1);
  } catch (e) {
    console.warn("Redis is unavailable for chat caching. Falling back to DB only.");
  }

  return { success: true, message: newMessage };
}

export async function getRecentChatMessages() {
  // Fetch from Redis first
  let cachedMessages = [];
  try {
    cachedMessages = await redis.lrange(CHAT_REDIS_KEY, 0, -1);
    if (cachedMessages.length > 0) {
      return cachedMessages.map(m => JSON.parse(m)).reverse(); // Oldest first for UI rendering
    }
  } catch (e) {
    console.warn("Redis is unavailable during fetch. Falling back to DB.");
  }

  // Fallback to DB if Redis is empty
  const messages = await prisma.chatMessage.findMany({
    take: MAX_CACHED_MESSAGES,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, username: true, role: true }
      }
    }
  });

  // Repopulate cache
  if (messages.length > 0) {
    try {
      const pipeline = redis.pipeline();
      messages.forEach(m => pipeline.rpush(CHAT_REDIS_KEY, JSON.stringify(m)));
      await pipeline.exec();
    } catch (e) {
      console.warn("Could not repopulate Redis cache.");
    }
  }

  return messages.reverse();
}

export async function reportSpam(messageId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false };

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: { isSpam: true }
  });

  // Clear cache to reflect change
  try { await redis.del(CHAT_REDIS_KEY); } catch (e) {}

  return { success: true };
}

export async function markHelpful(messageId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false };

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: { isHelpful: true }
  });

  // Clear cache to reflect change
  try { await redis.del(CHAT_REDIS_KEY); } catch (e) {}

  return { success: true };
}

export async function reactToMessage(messageId: string, type: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false };

  const message = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!message) return { success: false };

  let reactions = message.reactions as any[] || [];
  
  // Toggle reaction: remove if exists, add if not
  const existingIndex = reactions.findIndex(r => r.userId === session.user.id && r.type === type);
  if (existingIndex > -1) {
    reactions.splice(existingIndex, 1);
  } else {
    reactions.push({ userId: session.user.id, type });
  }

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: { reactions }
  });

  // Clear cache to reflect change
  try { await redis.del(CHAT_REDIS_KEY); } catch (e) {}

  // Gamification: If it's a 'like', award points to the MESSAGE OWNER if they hit 5 total likes today
  if (type === 'like' && existingIndex === -1) {
    const { incrementDailyTask } = await import("./gamification");
    await incrementDailyTask(message.userId, "CHAT_LIKES", 5, 250);
  }

  return { success: true };
}
