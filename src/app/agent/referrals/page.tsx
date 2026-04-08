import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Users, 
  Share2, 
  TrendingUp, 
  Gift, 
  UserPlus,
  Zap,
  Target,
  Trophy,
  ArrowUpRight
} from "lucide-react";
import { ReferralClient } from "./ReferralClient";
import { RedeemButton } from "./RedeemButton";
import { cn } from "@/lib/utils";

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: {
      referrals: true,
    }
  });

  const referralCode = user?.referralCode || "PENDING";
  const totalReferrals = user?.referrals.length || 0;
  const pendingRewards = totalReferrals * 500; // Mock calculation

  // For leaderboard, fetch top 3 referrers
  const topReferrers = await prisma.user.findMany({
    where: { role: "AGENT" },
    include: { _count: { select: { referrals: true } } },
    orderBy: { referrals: { _count: "desc" } },
    take: 3
  });

  return (
    <div className="animate-vapor">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-6xl font-black text-on-surface font-headline tracking-tighter mb-4 uppercase">
          Network <span className="text-primary">Expansion</span>
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl font-medium leading-relaxed">
          Scale your affiliate syndicate with precision. Track node propagation, manage referrals, and unlock elite kinetic rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Wallet / Stats Card */}
        <GlassCard className="lg:col-span-1 p-8 flex flex-col justify-between relative overflow-hidden group border-primary/20 bg-surface-container-low/40">
          <div className="absolute -top-10 -right-10 size-40 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Gift size={20} />
              </div>
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-on-surface-variant">Expansion Rewards</span>
            </div>
            
            <div className="flex items-baseline gap-3 mb-10">
              <span className="text-6xl font-black text-on-surface tracking-tighter font-headline">{(totalReferrals * 500).toLocaleString()}</span>
              <span className="text-primary font-black tracking-widest text-sm uppercase">PTS</span>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Active Nodes</span>
                  <span className="text-sm font-black text-on-surface">{totalReferrals} verified</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary shadow-[0_0_10px_rgba(129,236,255,0.4)]" style={{ width: `${Math.min(totalReferrals * 10, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <RedeemButton />
        </GlassCard>

        {/* Action / Link Card */}
        <GlassCard className="lg:col-span-2 p-10 flex flex-col justify-between border-primary/5 bg-surface-container-low/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-on-surface font-headline uppercase tracking-tight">Referral Frequency</h3>
              <p className="text-sm text-on-surface-variant font-medium">Broadcast your unique code to build your network.</p>
            </div>
            
            <div className="bg-surface-container-high border border-outline-variant/30 px-8 py-4 rounded-2xl flex items-center gap-5 shadow-inner">
              <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">Node Code</span>
              <span className="font-mono text-2xl font-black text-on-surface tracking-widest">{referralCode}</span>
            </div>
          </div>

          <ReferralClient referralCode={referralCode} />

          <div className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t border-white/5">
            {[
              { label: 'Network Size', val: totalReferrals.toString(), icon: <Users size={16} />, color: 'primary' },
              { label: 'Growth Rate', val: '+2.4%', icon: <TrendingUp size={16} />, color: 'primary' },
              { label: 'Efficiency', val: '100%', icon: <Zap size={16} />, color: 'secondary' }
            ].map((stat, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-surface-container-high/40 border border-outline-variant/10 flex flex-col gap-2">
                <div className={cn("text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2", stat.color === 'primary' ? "text-primary" : "text-secondary")}>
                  {stat.icon} {stat.label}
                </div>
                <p className="text-3xl font-black text-on-surface font-headline tracking-tighter">{stat.val}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Real-time List */}
        <GlassCard className="lg:col-span-8 p-0 overflow-hidden bg-surface-container-low/20 border-white/5 shadow-2xl flex flex-col">
          <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-headline text-2xl font-black text-on-surface uppercase tracking-tight flex items-center gap-4">
              <Zap className="text-primary" size={24} />
              Propagation Stream
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-surface-container-high/40">
                <tr>
                  <th className="px-10 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Operative</th>
                  <th className="px-10 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Status</th>
                  <th className="px-10 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Registered</th>
                  <th className="px-10 py-5 text-right pr-10 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {user?.referrals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-on-surface-variant font-medium text-xs">
                      No nodes detected. Spread your frequency to start earning.
                    </td>
                  </tr>
                ) : (
                  user?.referrals.map((row: any) => (
                    <tr key={row.id} className="group hover:bg-white/[0.03] transition-all duration-500">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-black text-xs border border-primary/20 text-primary uppercase">
                            {(row.name || row.username)?.[0]}
                          </div>
                          <span className="font-black text-on-surface text-sm tracking-tight">{row.name || row.username}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          row.kycStatus === 'APPROVED' ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 text-on-surface-variant/50 border-white/10"
                        )}>{row.kycStatus}</span>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                          {new Date(row.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right font-black text-primary text-sm tracking-widest">
                        +500
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Global Leaderboard */}
        <GlassCard className="lg:col-span-4 p-0 flex flex-col bg-surface-container-low/40 border-primary/5">
          <div className="p-10 border-b border-white/5">
            <h3 className="font-headline text-2xl font-black text-on-surface uppercase tracking-tight mb-8">Leaderboard</h3>
            <div className="flex gap-2 p-1.5 bg-surface-container-low/50 rounded-2xl border border-white/5 shadow-inner">
              <button className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary text-background shadow-lg transition-all">Top Nodes</button>
            </div>
          </div>
          
          <div className="p-6 space-y-5">
            {topReferrers.map((item: any, idx: number) => (
              <div 
                key={item.id} 
                className={cn(
                  "flex items-center gap-4 p-5 rounded-3xl border transition-all duration-500 overflow-hidden relative group cursor-pointer",
                  idx === 0 ? "bg-primary/5 border-primary/20 scale-[1.05] z-10 shadow-[0_0_30px_rgba(129,236,255,0.1)]" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-primary/10"
                )}
              >
                {idx === 0 && (
                  <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                    <Trophy size={64} className="text-primary" />
                  </div>
                )}
                <span className={cn("text-xl font-black italic tracking-tighter w-8", idx === 0 ? "text-primary" : "text-on-surface-variant/40")}>#{idx + 1}</span>
                <div className={cn(
                  "w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center border-2 transition-all p-[2px] text-primary font-bold uppercase",
                  idx === 0 ? "border-primary shadow-[0_0_15px_rgba(129,236,255,0.3)]" : "border-outline-variant/30 grayscale hover:grayscale-0"
                )}>
                  {(item.name || item.username)?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-black text-on-surface text-sm uppercase tracking-tight">{item.username || item.name}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">{(item as any)._count.referrals} Nodes Propagated</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
