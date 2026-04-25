"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

export async function getWhitelist() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SEMI_ADMIN", "CSR"].includes(session?.user?.role || "")) return [];

  return prisma.whitelistEntry.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function addToWhitelist(data: { type: "IP" | "USERNAME", value: string, reason?: string }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SEMI_ADMIN", "CSR"].includes(session?.user?.role || "")) return { success: false, error: "Unauthorized" };

  try {
    await prisma.whitelistEntry.create({
      data: {
        type: data.type,
        value: data.value,
        reason: data.reason,
        addedBy: session.user.name || "Admin"
      }
    });
    revalidatePath("/admin/whitelist");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "Already in whitelist." };
    return { success: false, error: "Failed to add." };
  }
}

export async function removeFromWhitelist(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false };

  await prisma.whitelistEntry.delete({ where: { id } });
  revalidatePath("/admin/whitelist");
  return { success: true };
}
