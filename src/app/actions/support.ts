"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export async function getOrCreateSupportTicket(guestInfo?: { guestId?: string, name?: string, email?: string }) {
  const session = await getServerSession(authOptions);
  
  try {
    if (session?.user) {
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
    } else if (guestInfo?.guestId) {
      // Guest logic
      let ticket = await prisma.supportTicket.findUnique({
        where: { guestId: guestInfo.guestId },
        include: { 
          messages: {
            orderBy: { createdAt: "asc" }
          } 
        }
      });

      if (!ticket) {
        ticket = await prisma.supportTicket.create({
          data: { 
            guestId: guestInfo.guestId,
            guestName: guestInfo.name,
            guestEmail: guestInfo.email
          },
          include: { 
            messages: {
              orderBy: { createdAt: "asc" }
            } 
          }
        });
      }

      return { success: true, ticket };
    }

    return { success: false, error: "Unauthorized or missing guest info" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendSupportMessage(ticketId: string, content: string, attachmentUrl?: string, attachmentType?: string) {
  const session = await getServerSession(authOptions);
  
  try {
    const isAdmin = session?.user && (session.user.role === "ADMIN" || session.user.role === "CSR");
    
    // Ensure attachmentUrl always has a leading slash if present
    const normalizedUrl = attachmentUrl 
      ? (attachmentUrl.startsWith('/') ? attachmentUrl : `/${attachmentUrl}`) 
      : undefined;

    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: session?.user?.id || "GUEST",
        content,
        isAdmin: !!isAdmin,
        attachmentUrl: normalizedUrl,
        attachmentType
      }
    });

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (ticket) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() }
      });

      // Global Notification Integration
      const notificationMsg = content.trim() 
        ? (content.length > 50 ? content.substring(0, 47) + "..." : content)
        : (attachmentUrl ? "Sent an attachment" : "New message");

      if (isAdmin) {
        // Admin sent message -> notify user (if not a guest)
        if (ticket.userId) {
          await prisma.notification.create({
            data: {
              userId: ticket.userId,
              title: "Nexus Support Message",
              message: notificationMsg,
              type: "INFO"
            }
          });
        }
      } else {
        // User/Guest sent message -> notify all staff (Admins, Semi-Admins, CSRs)
        const staff = await prisma.user.findMany({
          where: { 
            role: { in: ["ADMIN", "SEMI_ADMIN", "CSR"] } 
          },
          select: { id: true }
        });

        const senderName = ticket.guestName || "Agent";

        // Batch create notifications for all staff
        if (staff.length > 0) {
          await prisma.notification.createMany({
            data: staff.map(s => ({
              userId: s.id,
              title: `Support Alert: ${senderName}`,
              message: notificationMsg,
              type: "INFO"
            }))
          });
        }
      }
    }

    revalidatePath("/admin/support");
    revalidatePath("/agent/help");
    revalidatePath("/admin"); // For dashboard counts
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
  return prisma.supportMessage.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" }
  });
}

export async function uploadSupportAsset(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const uploadDir = join(process.cwd(), "public", "uploads", "support");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Robust sanitization: Remove all characters that might cause pathing/URL issues
    // Keep only alphanumeric, dots, dashes and underscores
    const sanitizedOriginalName = file.name
      .replace(/[^a-zA-Z0-9.\-_]/g, "_")
      .replace(/_{2,}/g, "_"); // Remove consecutive underscores

    const fileName = `${Date.now()}-${sanitizedOriginalName}`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    // Use /api/uploads route for runtime file serving — required for Next.js standalone Docker builds
    // where the static /public directory is not live-updated after container startup.
    const url = `/api/uploads/support/${fileName}`;

    return { success: true, url, type: file.type };
  } catch (error: any) {
    console.error("Support Upload Error:", error);
    return { success: false, error: "Failed to upload asset. Please check file permissions or size." };
  }
}
