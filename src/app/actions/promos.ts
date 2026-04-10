"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function getPromos() {
  return prisma.promo.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" }
  });
}

// Admin Actions
export async function adminCreatePromo(data: {
  title: string,
  description?: string,
  imageUrl?: string,
  active?: boolean
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    await prisma.promo.create({ data });
    revalidatePath("/agent");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminDeletePromo(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    await prisma.promo.delete({ where: { id } });
    revalidatePath("/agent");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadPromoImage(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const uploadDir = join(process.cwd(), "public", "uploads", "promos");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    const url = `/uploads/promos/${fileName}`;

    return { success: true, url };
  } catch (error: any) {
    console.error("Promo Upload Error:", error);
    return { success: false, error: "Failed to upload promo image." };
  }
}
