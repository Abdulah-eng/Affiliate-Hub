import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";
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
import { ChatHeaderDropdown } from "./ChatHeaderDropdown";

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
    rewardPoints: m.rewardPoints,
    attachmentUrl: m.attachmentUrl,
    attachmentType: m.attachmentType
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
    <div className="animate-vapor">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
            Nexus <span className="text-primary tracking-normal">Feed</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg font-medium mt-4">
            Direct synchronization with all active agents. Share intel, coordinate ops, and track performance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <GlassCard className="p-6 flex items-center gap-4 bg-primary/5 border-primary/20">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(129,236,255,0.1)]">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Active Transmissions</p>
            <p className="text-3xl font-black text-on-surface">{messages.length}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4 bg-secondary/5 border-secondary/10">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Node Occupancy</p>
            <p className="text-3xl font-black text-on-surface">{topChatters.length}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4 bg-amber-500/5 border-amber-500/10">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Total Reputation</p>
            <p className="text-3xl font-black text-on-surface">1.2M</p>
          </div>
        </GlassCard>
      </div>

      <div className="flex-1 flex min-h-0 min-w-0 gap-6 animate-vapor overflow-hidden">
        {/* Sidebar - Contacts & Groups */}
        <GlassCard className="w-80 hidden xl:flex flex-col border-white/5 pr-0 overflow-hidden shrink-0" innerClassName="h-full flex flex-col !p-0">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Nexus Lobby</h3>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
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
                    "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group",
                    item.active ? "bg-primary/10 text-primary border-l-2 border-primary shadow-[0_0_20px_rgba(129,236,255,0.05)]" : "text-on-surface-variant hover:bg-surface-container-high/50 hover:text-on-surface"
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

            <div className="pt-6 space-y-4">
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
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-container-high/30 transition-all cursor-pointer group border border-transparent hover:border-outline-variant/10"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-bold text-primary border border-primary/10">
                        {u.char}
                      </div>
                      <div className={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background", u.status.includes('Away') ? "bg-amber-500" : "bg-emerald-500 animate-pulse")} />
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
        </GlassCard>

        {/* Main Chat Feed */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <ChatClient 
            initialMessages={messages} 
            currentUserId={currentUserId} 
            userRole={session?.user?.role || "AGENT"}
          />
        </div>

        {/* Right Sidebar - Performance Hub */}
        <GlassCard className="w-80 hidden 2xl:flex flex-col border-white/5 overflow-hidden shrink-0" innerClassName="h-full flex flex-col !p-0">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Node Performance</h3>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-10">
            <div className="space-y-6">
              <GlassCard className="p-8 bg-surface-container-low/40 border-primary/10 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                  <Trophy size={64} className="text-primary" />
                </div>
                <div className="flex justify-between items-end mb-8 relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Reputation</p>
                    <h4 className="text-3xl font-black text-on-surface font-headline tracking-tighter">12,450 <span className="text-sm font-black text-primary">PTS</span></h4>
                  </div>
                </div>
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-center text-[9px] font-black tracking-widest text-[#a3aac4]">
                    <span>85% SYNCED</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden p-0.5 shadow-inner">
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
                    "p-4 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer bg-surface-container-low/20 border-outline-variant/10 hover:border-primary/10"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold uppercase border border-primary/20 text-[10px]">
                        ?
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-on-surface uppercase tracking-tight">Agent {chatter.userId.slice(0, 5)}</p>
                        <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">{chatter._count.id} Messages</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-white/5 bg-slate-950/20">
             <p className="text-[8px] font-black text-[#a3aac4] leading-relaxed uppercase tracking-widest text-center">
                AI-MONITORED ENGAGEMENT
             </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
