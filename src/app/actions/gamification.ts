"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function awardDailyTask(userId: string, taskKey: string, points: number, currency: "PTS" | "GCASH" = "PTS") {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const task = await prisma.userDailyTask.findUnique({
      where: { userId_taskKey: { userId, taskKey } }
    });

    // If never done or last reset was before today, reset count and lastResetAt
    if (!task || new Date(task.lastResetAt) < today) {
      await prisma.userDailyTask.upsert({
        where: { userId_taskKey: { userId, taskKey } },
        update: { 
          count: 1, 
          lastResetAt: new Date() 
        },
        create: { 
          userId, 
          taskKey, 
          count: 1, 
          lastResetAt: new Date() 
        }
      });

      // Award Points
      await prisma.pointTransaction.create({
        data: {
          userId,
          amount: points,
          currency: currency,
          type: taskKey,
          description: `Daily Goal: ${taskKey.replace(/_/g, ' ')}`,
          status: "COMPLETED"
        }
      });
      
      if (taskKey !== "DAILY_SURVIVAL") {
        await checkDailySurvivalKit(userId);
      }

      revalidatePath("/agent");
      return { success: true, awarded: true };
    }

    return { success: true, awarded: false };
  } catch (error) {
    console.error("Daily Task Error:", error);
    return { success: false };
  }
}

export async function incrementDailyTask(userId: string, taskKey: string, targetValue: number, points: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const task = await prisma.userDailyTask.findUnique({
      where: { userId_taskKey: { userId, taskKey } }
    });

    const isNewDay = !task || new Date(task.lastResetAt) < today;
    const currentCount = isNewDay ? 1 : task.count + 1;

    await prisma.userDailyTask.upsert({
      where: { userId_taskKey: { userId, taskKey } },
      update: { 
        count: currentCount, 
        lastResetAt: isNewDay ? new Date() : undefined 
      },
      create: { 
        userId, 
        taskKey, 
        count: 1, 
        lastResetAt: new Date() 
      }
    });

    // Award Points only if we just hit the target
    if (currentCount === targetValue) {
      await prisma.pointTransaction.create({
        data: {
          userId,
          amount: points,
          currency: "PTS",
          type: taskKey,
          description: `Daily Milestone: ${taskKey.replace(/_/g, ' ')}`,
          status: "COMPLETED"
        }
      });
      
      await checkDailySurvivalKit(userId);

      revalidatePath("/agent");
      return { success: true, awarded: true };
    }

    return { success: true, awarded: false };
  } catch (error) {
    console.error("Increment Daily Task Error:", error);
    return { success: false };
  }
}

export async function checkDailySurvivalKit(userId: string) {
  const tasks = ["DAILY_LOGIN", "FIRST_CHAT", "CHAT_LIKES"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completions = await prisma.userDailyTask.findMany({
    where: {
      userId,
      taskKey: { in: tasks },
      lastResetAt: { gte: today }
    }
  });

  // Specifically for CHAT_LIKES, we need to check if count >= 5
  const likesTask = completions.find(c => c.taskKey === "CHAT_LIKES");
  const othersDone = completions.filter(c => c.taskKey !== "CHAT_LIKES").length === 2;
  const allDone = othersDone && likesTask && likesTask.count >= 5;

  if (allDone) {
    return awardDailyTask(userId, "DAILY_SURVIVAL", 200, "GCASH");
  }
  return { success: true, awarded: false };
}
