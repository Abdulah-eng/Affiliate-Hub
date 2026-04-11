"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

export async function getTasks() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { items: [], dailyCount: 0 };

  const userId = (session.user as any).id;

  const [tasks, promos, submissions, dailyTask] = await Promise.all([
    prisma.task.findMany({
      include: {
        userProgress: {
          where: { userId }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.promo.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.promoSubmission.findMany({
      where: { userId }
    }),
    prisma.userDailyTask.findUnique({
      where: { userId_taskKey: { userId, taskKey: "DAILY_MISSIONS" } }
    })
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dailyCount = (dailyTask && dailyTask.lastResetAt >= today) ? dailyTask.count : 0;

  const mappedTasks = tasks.map(t => ({
    ...t,
    completed: t.userProgress.length > 0,
    taskType: "VIDEO"
  }));

  const mappedPromos = promos.map(p => {
    const sub = submissions.find(s => s.promoId === p.id);
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      points: p.pointsAward,
      imageUrl: p.imageUrl,
      completed: sub?.status === "APPROVED",
      submissionStatus: sub?.status, // PENDING, APPROVED, REJECTED
      requiresVerification: p.requiresVerification,
      taskType: "PROMO"
    };
  });

  return {
    items: [...mappedTasks, ...mappedPromos],
    dailyCount
  };
}

export async function completeTask(taskId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  const userId = (session.user as any).id;

  try {
    return await prisma.$transaction(async (tx) => {
      // Check if already completed
      const existing = await tx.userTaskProgress.findUnique({
        where: { userId_taskId: { userId, taskId } }
      });

      if (existing) return { success: false, error: "Task already completed" };

      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (!task) throw new Error("Task not found");

      // Record progress
      await tx.userTaskProgress.create({
        data: { userId, taskId, status: "COMPLETED" }
      });

      // Award points
      await tx.pointTransaction.create({
        data: {
          userId,
          amount: task.points,
          type: "TASK_REWARD",
          description: `Completed task: ${task.title}`,
          status: "COMPLETED"
        }
      });

      // --- Daily Mission Bonus Logic ---
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let dailyTask = await tx.userDailyTask.findUnique({
        where: { userId_taskKey: { userId, taskKey: "DAILY_MISSIONS" } }
      });

      // Reset if lastResetAt is before today
      if (dailyTask && dailyTask.lastResetAt < today) {
        dailyTask = await tx.userDailyTask.update({
          where: { id: dailyTask.id },
          data: { count: 0, lastResetAt: new Date() }
        });
      }

      if (!dailyTask) {
        dailyTask = await tx.userDailyTask.create({
          data: { userId, taskKey: "DAILY_MISSIONS", count: 0, lastResetAt: new Date() }
        });
      }

      // Increment count
      const newCount = dailyTask.count + 1;
      await tx.userDailyTask.update({
        where: { id: dailyTask.id },
        data: { count: newCount }
      });

      // Award bonus at exactly 3 missions
      if (newCount === 3) {
        await tx.pointTransaction.create({
          data: {
            userId,
            amount: 200,
            type: "DAILY_BONUS",
            description: "Daily Mission Milestone: 3 Missions Completed",
            status: "COMPLETED"
          }
        });

        await tx.notification.create({
          data: {
            userId,
            title: "Daily Goal Achieved!",
            message: "You've earned a +200 PTS bonus for completing 3 missions today!",
            type: "SUCCESS"
          }
        });
      }
      // ---------------------------------

      // Notification
      await tx.notification.create({
        data: {
          userId,
          title: "Points Earned!",
          message: `You earned ${task.points} PTS for completing: ${task.title}`,
          type: "SUCCESS"
        }
      });

      return { success: true };
    });
  } catch (error: any) {
    console.error("Complete Task Error:", error);
    return { success: false, error: error.message || "Failed to complete task" };
  }
}

// Admin Actions
export async function adminCreateTask(data: {
  title: string,
  description?: string,
  points: number,
  videoUrl?: string,
  isExternal?: boolean,
  type?: string
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    await prisma.task.create({ data });
    revalidatePath("/admin/tasks");
    revalidatePath("/agent/tasks");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminDeleteTask(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    await prisma.task.delete({ where: { id } });
    revalidatePath("/admin/tasks");
    revalidatePath("/agent/tasks");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
