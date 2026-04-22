import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import KYCReviewDetail from "./KYCReviewDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ReviewDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id: id },
    include: {
      platforms: { include: { brand: true } }
    }
  });

  if (!user) {
    notFound();
  }

  // Fetch all brands so CSR can assign
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });

  const isLocalIp = (ip: string) => ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(ip);

  // Fetch accounts sharing the same IP
  const sharedIpUsers = user.registrationIp && !isLocalIp(user.registrationIp) ? await prisma.user.findMany({
    where: {
      id: { not: user.id },
      role: "AGENT",
      OR: [
        { registrationIp: user.registrationIp },
        { lastLoginIp: user.registrationIp },
        ...(user.lastLoginIp && !isLocalIp(user.lastLoginIp) ? [{ registrationIp: user.lastLoginIp }, { lastLoginIp: user.lastLoginIp }] : [])
      ]
    },
    select: { username: true, id: true, kycStatus: true }
  }) : [];

  return (
    <KYCReviewDetail
      user={{
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        affiliateUsername: user.affiliateUsername || "",
        location: user.location || "",
        idPhotoUrl: user.idPhotoUrl,
        selfieUrl: user.selfieUrl,
        kycStatus: user.kycStatus,
        kycNotes: user.kycNotes || "",
        mobileNumber: user.mobileNumber || "",
        registrationIp: user.registrationIp || "N/A",
        lastLoginIp: user.lastLoginIp || "N/A",
        kycSubmittedAt: user.kycSubmittedAt?.toISOString() || null,
        kycReviewedAt: user.kycReviewedAt?.toISOString() || null,
        kycSecondaryId1FrontUrl: user.kycSecondaryId1FrontUrl,
        kycSecondaryId1BackUrl: user.kycSecondaryId1BackUrl,
        kycSecondaryId2FrontUrl: user.kycSecondaryId2FrontUrl,
        kycSecondaryId2BackUrl: user.kycSecondaryId2BackUrl,
      }}
      sharedIpAccounts={sharedIpUsers.map(u => ({
        id: u.id,
        username: u.username || "agent",
        kycStatus: u.kycStatus as string
      }))}
      platforms={user.platforms.map((p: any) => ({
        id: p.id,
        brandId: p.brandId,
        brandName: p.brand.name,
        username: p.username || "",
        password: p.password || "",
        playerUsername: p.playerUsername || "",
        playerPassword: p.playerPassword || "",
        status: p.status
      }))}
      allBrands={brands.map((b: any) => ({ id: b.id, name: b.name, loginUrl: b.loginUrl || "" }))}
    />
  );
}
