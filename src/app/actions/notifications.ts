"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications(userId: string) {
  try {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return [];
  }
}

export async function markAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
    revalidatePath("/agent");
    return { success: true };
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    return { success: false, error: "Failed to mark as read." };
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    revalidatePath("/agent");
    return { success: true };
  } catch (error) {
    console.error("Mark All Read Error:", error);
    return { success: false, error: "Failed to mark all as read." };
  }
}

export async function createNotification(userId: string, title: string, message: string, type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO") {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type
      }
    });
    // Normally we'd push event to websocket or let polling pick it up. Revalidate might clear some caches.
    revalidatePath("/agent");
    return { success: true };
  } catch (error) {
    console.error("Create Notification Error:", error);
    return { success: false, error: "Failed to create notification." };
  }
}

export async function broadcastNotification(title: string, message: string, type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO") {
  try {
    const agents = await prisma.user.findMany({
      where: { role: "AGENT" },
      select: { id: true }
    });

    const data = agents.map(agent => ({
      userId: agent.id,
      title,
      message,
      type
    }));

    // Batch insert
    await prisma.notification.createMany({
      data
    });
    
    // Attempt revalidate
    revalidatePath("/agent");
    return { success: true, count: data.length };
  } catch (error) {
    console.error("Broadcast Notification Error:", error);
    return { success: false, error: "Failed to broadcast." };
  }
}
