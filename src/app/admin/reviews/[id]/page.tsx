import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import KYCReviewDetail from "./KYCReviewDetail";

type Props = {
  params: { id: string };
};

export default async function ReviewDetailPage({ params }: Props) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      platforms: { include: { brand: true } }
    }
  });

  if (!user) {
    notFound();
  }

  // Fetch all brands so CSR can assign
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });

  return (
    <KYCReviewDetail
      user={{
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        telegram: user.telegram || "",
        location: user.location || "",
        idPhotoUrl: user.idPhotoUrl,
        selfieUrl: user.selfieUrl,
        kycStatus: user.kycStatus,
        kycNotes: user.kycNotes || "",
        kycSubmittedAt: user.kycSubmittedAt?.toISOString() || null,
        kycReviewedAt: user.kycReviewedAt?.toISOString() || null
      }}
      platforms={user.platforms.map((p: any) => ({
        id: p.id,
        brandId: p.brandId,
        brandName: p.brand.name,
        username: p.username || "",
        password: p.password || "",
        status: p.status
      }))}
      allBrands={brands.map((b: any) => ({ id: b.id, name: b.name, loginUrl: b.loginUrl || "" }))}
    />
  );
}
