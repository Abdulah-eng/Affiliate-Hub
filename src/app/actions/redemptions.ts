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

export async function addRedemptionProduct(data: {
  name: string;
  description: string;
  pointsCost: number;
  type: string;
  imageUrl?: string;
  stock?: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    const product = await prisma.redemptionProduct.create({
      data: {
        name: data.name,
        description: data.description,
        pointsCost: data.pointsCost,
        type: data.type,
        imageUrl: data.imageUrl,
        stock: data.stock ?? -1,
        isActive: true
      }
    });

    revalidatePath("/admin/redemptions");
    revalidatePath("/agent/wallet");
    return { success: true, product };
  } catch (error) {
    console.error("Add Product Error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function uploadProductImage(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const { writeFile, mkdir } = await import("fs/promises");
    const { join } = await import("path");
    
    const uploadDir = join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    const url = `/uploads/products/${fileName}`;

    return { success: true, url };
  } catch (error: any) {
    console.error("Product Image Upload Error:", error);
    return { success: false, error: "Failed to upload product image" };
  }
}

export async function updateRedemptionProduct(id: string, data: {
  name: string;
  description: string;
  pointsCost: number;
  type: string;
  imageUrl?: string;
  stock?: number;
  isActive?: boolean;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    await prisma.redemptionProduct.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        pointsCost: data.pointsCost,
        type: data.type,
        imageUrl: data.imageUrl,
        stock: data.stock ?? -1,
        isActive: data.isActive ?? true
      }
    });

    revalidatePath("/admin/redemptions");
    revalidatePath("/agent/wallet");
    return { success: true };
  } catch (error) {
    console.error("Update Product Error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteRedemptionProduct(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    await prisma.redemptionProduct.delete({ where: { id } });
    revalidatePath("/admin/redemptions");
    revalidatePath("/agent/wallet");
    return { success: true };
  } catch (error) {
    console.error("Delete Product Error:", error);
    return { success: false, error: "Failed to delete product" };
  }
}
