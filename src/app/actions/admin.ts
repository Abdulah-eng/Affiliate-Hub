"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPendingApplications() {
  return prisma.user.findMany({
    where: { kycStatus: "PENDING" },
    include: { platforms: { include: { brand: true } } },
    orderBy: { kycSubmittedAt: "desc" }
  });
}

export async function reviewApplication(
  userId: string, 
  status: "APPROVED" | "REJECTED" | "REQUEST_REUPLOAD", 
  notes?: string,
  platformAssignments?: { brandId: string; username: string; password?: string }[]
) {
  try {
    await prisma.$transaction(async (tx) => {
      // Update User KYC status
      await tx.user.update({
        where: { id: userId },
        data: {
          kycStatus: status,
          kycReviewedAt: new Date(),
          kycNotes: notes
        }
      });

      // If approved, setup the platform access credentials
      if (status === "APPROVED" && platformAssignments) {
        for (const assignment of platformAssignments) {
          await tx.platformAccess.upsert({
             where: {
               userId_brandId: {
                 userId: userId,
                 brandId: assignment.brandId
               }
             },
             update: {
               status: "APPROVED",
               username: assignment.username,
               password: assignment.password
             },
             create: {
               userId,
               brandId: assignment.brandId,
               username: assignment.username,
               password: assignment.password,
               status: "APPROVED"
             }
          });
        }
      }
    });

    revalidatePath("/admin/review");
    revalidatePath("/admin/reviews/history");
    return { success: true };
  } catch (error) {
    console.error("KYC Review Error:", error);
    return { success: false, error: "Failed to update review status." };
  }
}

export async function getAllBrands() {
  return prisma.brand.findMany({
    orderBy: { createdAt: "asc" }
  });
}

export async function updateBrandLoginUrl(brandId: string, loginUrl: string) {
  await prisma.brand.update({
    where: { id: brandId },
    data: { loginUrl }
  });
  revalidatePath("/admin/brands");
}

export async function updateBrandStatus(brandId: string, status: string) {
  await prisma.brand.update({
    where: { id: brandId },
    data: { status }
  });
  revalidatePath("/admin/brands");
}

export async function getSystemSettings() {
  return prisma.systemSetting.findMany({
    orderBy: { key: "asc" }
  });
}

export async function updateSystemSettings(updates: Record<string, string>) {
  try {
    for (const [key, value] of Object.entries(updates)) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Settings Update Error:", error);
    return { success: false };
  }
}

export async function getAuditLogs() {
  return prisma.pointTransaction.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 50
  });
}

export async function getReviewHistory() {
  return prisma.user.findMany({
    where: { 
      kycStatus: { not: "PENDING" }
    },
    orderBy: { kycReviewedAt: "desc" },
    take: 50
  });
}
