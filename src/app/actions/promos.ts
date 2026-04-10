"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

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
