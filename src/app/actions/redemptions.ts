"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// --- Agent Actions ---

export async function getRedemptionProducts() {
  try {
    const products = await prisma.redemptionProduct.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: 'asc' }
    });
    return { success: true, products };
  } catch (error) {
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function submitRedemptionRequest(productId: string, verificationDetails: any) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  const userId = session.user.id;

  try {
    const product = await prisma.redemptionProduct.findUnique({ where: { id: productId } });
    if (!product) return { success: false, error: "Product not found" };

    // Check if user has enough points
    const transactions = await prisma.pointTransaction.findMany({
        where: { userId, status: "COMPLETED", currency: "PTS" }
    });
    const currentPoints = transactions.reduce((sum, t) => sum + t.amount, 0);

    if (currentPoints < product.pointsCost) {
      return { success: false, error: "Insufficient Kinetic Points" };
    }

    // Create request (Status: PENDING)
    // Points are NOT deducted yet (As requested: "upon manual admin approval")
    await prisma.redemptionRequest.create({
      data: {
        userId,
        productId,
        verificationDetails: verificationDetails || {},
        status: "PENDING"
      }
    });

    revalidatePath("/agent/wallet");
    return { success: true };
  } catch (error) {
    console.error("Redemption Submit Error:", error);
    return { success: false, error: "Failed to submit request" };
  }
}

// --- Admin Actions ---

export async function getPendingRedemptions() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    const requests = await prisma.redemptionRequest.findMany({
      include: {
        user: { select: { name: true, email: true, username: true } },
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, requests };
  } catch (error) {
    return { success: false, error: "Failed to fetch requests" };
  }
}

export async function processRedemption(requestId: string, status: "APPROVED" | "REJECTED", adminNotes?: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    const request = await prisma.redemptionRequest.findUnique({
      where: { id: requestId },
      include: { product: true }
    });

    if (!request || !request.product) return { success: false, error: "Request or Product not found" };
    if (request.status !== "PENDING") return { success: false, error: "Request already processed" };

    if (status === "APPROVED") {
      // DEDUCT POINTS NOW
      await prisma.$transaction([
        prisma.pointTransaction.create({
          data: {
            userId: request.userId,
            amount: -request.product.pointsCost,
            currency: "PTS",
            type: "REDEMPTION",
            status: "COMPLETED",
            description: `Redemption Approved: ${request.product.name}`
          }
        }),
        prisma.redemptionRequest.update({
          where: { id: requestId },
          data: {
            status: "APPROVED",
            pointsDeducted: request.product.pointsCost,
            adminNotes
          }
        })
      ]);
    } else {
      await prisma.redemptionRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED", adminNotes }
      });
    }

    revalidatePath("/admin/redemptions");
    revalidatePath("/agent/wallet");
    return { success: true };
  } catch (error) {
    console.error("Process Redemption Error:", error);
    return { success: false, error: "Failed to process request" };
  }
}

export async function seedInitialProducts() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const initialProducts = [
        { name: "100 PHP GCash", pointsCost: 1000, type: "GCASH", description: "Direct transfer to your GCash wallet." },
        { name: "500 PHP GCash", pointsCost: 4500, type: "GCASH", description: "Discounted bulk extraction." },
        { name: "Kinetic Gaming T-Shirt", pointsCost: 5000, type: "PRODUCT", description: "Limited edition agent apparel. (Requires Shipping Address)" },
        { name: "Mystery Tech Crate", pointsCost: 15000, type: "PRODUCT", description: "High-tier hardware for elite operatives. (Requires Shipping Address)" }
    ];

    try {
        for (const p of initialProducts) {
            await prisma.redemptionProduct.create({ data: p });
        }
        return { success: true };
    } catch (e) {
        return { success: false, error: "Seeding failed" };
    }
}
