import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AgentDashboardClient from "./AgentDashboardClient";


export default async function AgentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // Always fetch fresh user status from DB in the server component
  // to avoid NextAuth session caching delays in the RSC payload
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycStatus: true, name: true, email: true, username: true }
  });

  const kycStatus = dbUser?.kycStatus || "PENDING";
  const userName = dbUser?.name || dbUser?.username || dbUser?.email || "Agent";

  // Fetch the agent's platform access from the database
  const platforms = await prisma.platformAccess.findMany({
    where: { userId },
    include: { brand: true },
    orderBy: { brand: { name: "asc" } }
  });

  // Fetch recent announcements from SystemSettings used as announcements
  // (in a full build you'd have an Announcements model)
  const announcements = [
    {
      tag: "SYSTEM",
      time: "Just now",
      title: "Welcome to Affiliate Hub PH!",
      desc: "Your KYC application is under review. You'll be notified once approved.",
      color: "text-primary"
    }
  ];

  return (
    <AgentDashboardClient
      platforms={platforms.map((p) => ({
        id: p.id,
        brandId: p.brandId,
        brandName: p.brand.name,
        loginUrl: p.brand.loginUrl || "",
        username: p.username || "",
        password: p.password || "",
        status: p.status
      }))}
      announcements={announcements}
      userName={userName}
      kycStatus={kycStatus}
    />
  );
}
