import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ChatClient } from "./ChatClient";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Zap, 
  Users, 
  Trophy, 
  Lock, 
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientSoon } from "@/components/ui/ClientSoon";

export default async function NexusFeedPage() {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id || "";

  // Fetch initial 50 messages
  const initialData = await prisma.chatMessage.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          username: true,
          role: true,
          id: true
        }
      }
    }
  });

  // Re-sort to ascending for the UI
  const messages = initialData.reverse().map((m: any) => ({
    id: m.id,
    content: m.content,
    userId: m.userId,
    userName: m.user.name || m.user.username || "Agent",
    userRole: m.user.role,
    createdAt: m.createdAt.toISOString(),
    rewardPoints: m.rewardPoints
  }));

  // Get top chatters
  const topChatters = await prisma.chatMessage.groupBy({
    by: ["userId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5
  });

  // Fetch user data for reputations (Mock or real)
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { name: true, username: true, role: true }
  });

  return (
    <div className="flex h-[calc(100vh-220px)] animate-vapor -mt-4">
      {/* Sidebar - Contacts & Groups */}
      <div className="w-80 hidden lg:flex flex-col border-r border-white/5 pr-8 space-y-8 overflow-y-auto no-scrollbar">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2">Nexus Lobby</h3>
          <div className="space-y-2">
            {[
              { name: 'Global Chat', icon: <Users size={18} />, active: true, count: '1.2k' },
              { name: 'Private Nodes', icon: <Lock size={18} />, count: '0' },
              { name: 'Squad Groups', icon: <Users size={18} />, count: '2' }
            ].map((item, idx) => (
              <ClientSoon 
                key={idx} 
                as="button"
                message={`Connecting to ${item.name} is currently offline.`}
                className={cn(
                  "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group",
                  item.active ? "bg-primary/10 text-primary border-l-2 border-primary shadow-[0_0_20px_rgba(129,236,255,0.05)]" : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                )}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm font-black uppercase tracking-tight">{item.name}</span>
                </div>
                <span className="text-[10px] font-black opacity-40">{item.count}</span>
              </ClientSoon>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-2 no-scrollbar">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2">Active Operatives</h3>
          <div className="space-y-3">
            {[
              { name: 'Cyber_Merchant', status: 'Healthy', char: 'C' },
              { name: 'Sarah_Ops', status: 'Away (5m)', char: 'S' },
              { name: 'PinoAffiliate_CEO', status: 'Healthy', char: 'P' }
            ].map((u, i) => (
              <ClientSoon 
                key={i} 
                as="div"
                message={`Direct connection to ${u.name} is unavailable.`}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/[0.03] transition-all cursor-pointer group border border-transparent hover:border-white/5"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-bold text-primary border border-primary/10">
                    {u.char}
                  </div>
                  <div className={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950", u.status.includes('Away') ? "bg-amber-500" : "bg-emerald-500 animate-pulse")} />
                </div>
                <div>
                  <p className="text-xs font-black text-on-surface uppercase tracking-tight group-hover:text-primary transition-colors">{u.name}</p>
                  <p className="text-[9px] text-on-surface-variant font-medium uppercase">{u.status}</p>
                </div>
              </ClientSoon>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Feed */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-10 py-6 border-y lg:border-t-0 border-white/5 flex items-center justify-between bg-white/[0.02] rounded-t-3xl lg:rounded-tl-none">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(129,236,255,0.1)]">
              <Zap fill="currentColor" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black font-headline text-on-surface uppercase tracking-tight">Nexus Feed</h2>
              <p className="text-xs text-on-surface-variant font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Real-time synchronization active
              </p>
            </div>
          </div>
          <ClientSoon 
            as="button"
            message="Additional channel options coming soon."
            className="p-3 text-on-surface-variant hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"
          >
            <MoreVertical size={20} />
          </ClientSoon>
        </div>

        <ChatClient 
          initialMessages={messages} 
          currentUserId={currentUserId} 
        />
      </div>

      {/* Right Sidebar - Performance Hub */}
      <div className="w-96 hidden xl:flex flex-col border-l border-white/5 pl-8 space-y-10 overflow-y-auto no-scrollbar">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2">Node Performance</h3>
          <GlassCard className="p-8 bg-surface-container-low/40 border-primary/10 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-700">
               <Trophy size={64} className="text-primary" />
            </div>
            <div className="flex justify-between items-end mb-8 relative z-10">
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Nexus Reputation</p>
                <h4 className="text-4xl font-black text-on-surface font-headline tracking-tighter">12,450 <span className="text-sm font-black text-primary">PTS</span></h4>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Rank</p>
                <span className="text-sm font-black text-on-surface italic">#42 GLOBAL</span>
              </div>
            </div>
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center text-[9px] font-black tracking-widest text-[#a3aac4]">
                 <span>GOAL: OVERLORD</span>
                 <span>85% SYNCED</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 shadow-inner">
                 <div className="bg-gradient-to-r from-primary to-secondary h-full w-[85%] rounded-full shadow-[0_0_15px_rgba(129,236,255,0.3)]" />
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2">Top Transmitters</h3>
          <div className="space-y-3">
             {topChatters.map((chatter: any, i: number) => (
                <div key={chatter.userId} className={cn(
                  "p-5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer bg-white/[0.02] border-white/5 hover:border-primary/10"
                )}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold uppercase border border-primary/20">
                      ?
                    </div>
                    <div>
                      <p className="text-xs font-black text-on-surface uppercase tracking-tight">Agent {chatter.userId.slice(0, 5)}</p>
                      <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">{chatter._count.id} Messages Sync'd</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-primary">ACTIVE</span>
                </div>
             ))}
          </div>
        </div>

        <div className="mt-auto p-6 rounded-3xl bg-slate-950/40 border border-white/5">
           <p className="text-[9px] font-black text-[#a3aac4] leading-relaxed uppercase tracking-widest text-center">
              <span className="text-primary">FAIR PLAY NOTICE:</span> ENGAGEMENT REWARDS ARE AI-MONITORED. VIOLATIONS LEAD TO PERMANENT VAULT SUSPENSION.
           </p>
        </div>
      </div>
    </div>
  );
}
