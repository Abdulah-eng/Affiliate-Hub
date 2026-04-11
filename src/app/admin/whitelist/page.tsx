import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { getWhitelist } from "@/app/actions/whitelist";
import WhitelistClient from "./WhitelistClient";

export const dynamic = "force-dynamic";

export default async function WhitelistPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/agent");
  }

  const entries = await getWhitelist();

  return (
    <WhitelistClient initialEntries={entries} />
  );
}
