"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export async function createAd(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const externalLink = formData.get("externalLink") as string;
    const imageLink = formData.get("imageLink") as string;
    const file = formData.get("image") as File | null;
    const priority = parseInt(formData.get("priority") as string || "0");

    let imageUrl = "";

    if (file && file.size > 0) {
      const uploadDir = join(process.cwd(), "public", "uploads", "ads");
      await mkdir(uploadDir, { recursive: true });

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      imageUrl = `/uploads/ads/${fileName}`;
    } else if (imageLink) {
      imageUrl = imageLink;
    } else {
      throw new Error("Either an image file or an image URL is required");
    }

    await prisma.advertisement.create({
      data: {
        title,
        imageUrl,
        externalLink,
        priority,
        isActive: true
      }
    });

    revalidatePath("/admin/ads");
    revalidatePath("/agent");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleAdStatus(id: string, isActive: boolean) {
  try {
    await prisma.advertisement.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath("/admin/ads");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAd(id: string) {
  try {
    await prisma.advertisement.delete({
      where: { id }
    });
    revalidatePath("/admin/ads");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getActiveAds() {
  return await prisma.advertisement.findMany({
    where: { isActive: true },
    orderBy: { priority: "desc" }
  });
}

export async function getAllAds() {
  return await prisma.advertisement.findMany({
    orderBy: { createdAt: "desc" }
  });
}
