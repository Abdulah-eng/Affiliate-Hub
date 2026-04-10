import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PlatformsClient from "./PlatformsClient";

export const dynamic = "force-dynamic";

export default async function PlatformsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // 1. Fetch user status to check KYC
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycStatus: true }
  });

  // 2. Fetch all active brands and current agent status for each
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    include: {
      accessItems: {
        where: { userId }
      }
    },
    orderBy: { name: "asc" }
  });

  return (
    <PlatformsClient 
      brands={brands.map(b => ({
        id: b.id,
        name: b.name,
        logoUrl: b.logoUrl,
        description: b.description,
        status: b.accessItems[0]?.status || "AVAILABLE", // AVAILABLE, PENDING, APPROVED, REJECTED
      }))}
      kycStatus={user?.kycStatus || "PENDING"}
    />
  );
}
