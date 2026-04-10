"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

export async function getTasks() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return [];

  const userId = (session.user as any).id;

  const tasks = await prisma.task.findMany({
    include: {
      userProgress: {
        where: { userId }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return tasks.map(t => ({
    ...t,
    completed: t.userProgress.length > 0
  }));
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
