import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { RaffleArenaClient } from "./RaffleArenaClient";

export default async function RaffleArenaPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { kycStatus: true }
  });

  // Mocking 1 ticket per 1000 points or some other logic
  const userPoints = (user as any)?.points || 24500;
  const userTickets = Math.floor(userPoints / 1000);

  return (
    <RaffleArenaClient 
      userPoints={userPoints} 
      userTickets={userTickets} 
    />
  );
}
