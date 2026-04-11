import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const messages = await prisma.chatMessage.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            role: true,
            id: true
          }
        }
      }
    });

    // Re-sort to ascending
    const formatted = messages.reverse().map((m: any) => ({
      id: m.id,
      content: m.content,
      userId: m.userId,
      userName: m.user.name || m.user.username || "Agent",
      userRole: m.user.role,
      createdAt: m.createdAt.toISOString(),
      rewardPoints: m.rewardPoints,
      reactions: m.reactions,
      isSpam: m.isSpam,
      isHelpful: m.isHelpful
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Failed to sync chat" }, { status: 500 });
  }
}
