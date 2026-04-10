"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

export async function applyForPlatform(brandId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  const userId = (session.user as any).id;

  try {
    // 1. Verify KYC is approved
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true }
    });

    if (user?.kycStatus !== "APPROVED") {
      return { success: false, error: "KYC approval required to request new platforms." };
    }

    // 2. Create pending platform access
    // Use upsert to handle cases where they previously applied (rejected/pending)
    await prisma.platformAccess.upsert({
      where: {
        userId_brandId: {
          userId,
          brandId
        }
      },
      update: {
        status: "PENDING"
      },
      create: {
        userId,
        brandId,
        status: "PENDING"
      }
    });

    // 3. Create notification for Admin (optional, but we'll create one for user)
    await prisma.notification.create({
      data: {
        userId,
        title: "Platform Requested",
        message: "Your application for a new platform has been received and is under review.",
        type: "INFO"
      }
    });

    revalidatePath("/agent");
    revalidatePath("/agent/platforms");
    return { success: true };
  } catch (error: any) {
    console.error("Platform Application Error:", error);
    return { success: false, error: "Failed to submit request." };
  }
}

export async function getAvailableBrandsForAgent() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return [];

  const userId = (session.user as any).id;

  // Fetch all active brands and include the specific agent's access status
  return prisma.brand.findMany({
    where: { isActive: true },
    include: {
      accessItems: {
        where: { userId }
      }
    },
    orderBy: { name: "asc" }
  });
}
