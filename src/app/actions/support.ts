"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

export async function getOrCreateSupportTicket() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  try {
    const userId = session.user.id;
    let ticket = await prisma.supportTicket.findFirst({
      where: { userId, status: "OPEN" },
      include: { 
        messages: {
          orderBy: { createdAt: "asc" }
        } 
      }
    });

    if (!ticket) {
      ticket = await prisma.supportTicket.create({
        data: { userId },
        include: { 
          messages: {
            orderBy: { createdAt: "asc" }
          } 
        }
      });
    }

    return { success: true, ticket };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendSupportMessage(ticketId: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  try {
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "CSR";
    
    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: session.user.id,
        content,
        isAdmin
      }
    });

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    });

    revalidatePath("/admin/support");
    return { success: true, message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminGetPendingTickets() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "CSR")) {
    return [];
  }

  return prisma.supportTicket.findMany({
    where: { status: "OPEN" },
    include: {
      user: {
        select: {
          name: true,
          username: true,
          image: true
        }
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function adminResolveTicket(ticketId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "CSR")) {
     return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: "RESOLVED" }
    });
    revalidatePath("/admin/support");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTicketMessages(ticketId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return [];

  return prisma.supportMessage.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" }
  });
}
