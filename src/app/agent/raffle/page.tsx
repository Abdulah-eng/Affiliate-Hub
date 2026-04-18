import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { RaffleArenaClient } from "./RaffleArenaClient";
import { getAgentWallet } from "@/app/actions/wallet";

export const dynamic = "force-dynamic";

export default async function RaffleArenaPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const wallet = await getAgentWallet();
  const userPoints = wallet?.totalPoints ?? 0;
  const userTickets = Math.floor(userPoints / 1000);

  // Fetch prizes from settings
  const { prisma } = await import("@/lib/prisma");
  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: ["CMS_RAFFLE_STANDARD_PRIZES", "CMS_RAFFLE_GRAND_PRIZES"] } }
  });
  
  const standardPrizes = settings.find(s => s.key === "CMS_RAFFLE_STANDARD_PRIZES")?.value;
  const grandPrizes = settings.find(s => s.key === "CMS_RAFFLE_GRAND_PRIZES")?.value;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full max-w-full overflow-hidden">
      <RaffleArenaClient 
        userPoints={userPoints} 
        userTickets={userTickets} 
        standardPrizesJson={standardPrizes}
        grandPrizesJson={grandPrizes}
      />
    </div>
  );
}
