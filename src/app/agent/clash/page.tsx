import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { ClashClient } from "./ClashClient";

export const dynamic = "force-dynamic";

export default async function ClashPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as any).id;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <ClashClient userId={userId} />
    </div>
  );
}
