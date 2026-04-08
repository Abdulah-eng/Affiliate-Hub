import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { PushYourLuckClient } from "./PushYourLuckClient";
import { getAgentWallet } from "@/app/actions/wallet";

export const dynamic = "force-dynamic";

export default async function LuckArenaPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }

  const wallet = await getAgentWallet();
  const userPoints = wallet?.totalPoints || 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <PushYourLuckClient userPoints={userPoints} />
    </div>
  );
}
