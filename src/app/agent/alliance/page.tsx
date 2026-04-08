import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { AllianceClient } from "./AllianceClient";

export const dynamic = "force-dynamic";

export default async function AlliancePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as any).id;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <AllianceClient userId={userId} />
    </div>
  );
}
