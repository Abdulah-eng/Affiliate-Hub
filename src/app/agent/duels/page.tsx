import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { DuelClient } from "./DuelClient";

export const dynamic = "force-dynamic";

export default async function DuelsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }

  const userId = (session.user as any).id;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <DuelClient userId={userId} />
    </div>
  );
}
