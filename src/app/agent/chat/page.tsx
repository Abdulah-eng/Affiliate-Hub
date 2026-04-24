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
    <div className="flex-1 flex min-h-0 min-w-0 animate-vapor h-[calc(100vh-176px)] overflow-hidden">
      {/* Sidebar - Contacts & Groups */}
      <div className="w-72 hidden xl:flex flex-col border-r border-outline-variant/10 pr-6 space-y-8 overflow-y-auto no-scrollbar shrink-0">
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

      {/* Main Chat Feed */}
      <div className="flex-1 flex flex-col min-w-0 lg:px-6 h-full relative">
        <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/20 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(129,236,255,0.1)]">
              <Zap fill="currentColor" size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-headline text-on-surface uppercase tracking-tight leading-tight">Nexus Feed</h2>
              <p className="text-[10px] sm:text-xs text-on-surface-variant font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden xs:inline">Real-time synchronization active</span>
                <span className="xs:hidden">Live Sync</span>
              </p>
            </div>
          </div>
          <ChatHeaderDropdown />
        </div>

        <div className="flex-1 flex flex-col min-w-0 max-w-5xl mx-auto w-full h-full relative">
          <ChatClient 
            initialMessages={messages} 
            currentUserId={currentUserId} 
            userRole={session?.user?.role || "AGENT"}
          />
        </div>
      </div>

      {/* Right Sidebar - Performance Hub */}
      <div className="w-80 hidden 2xl:flex flex-col border-l border-outline-variant/10 pl-6 space-y-10 overflow-y-auto no-scrollbar shrink-0">
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
                  "p-5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer bg-surface-container-low/20 border-outline-variant/10 hover:border-primary/10"
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

        <div className="mt-auto p-6 rounded-3xl bg-surface-container-low/40 border border-outline-variant/10">
           <p className="text-[9px] font-black text-[#a3aac4] leading-relaxed uppercase tracking-widest text-center">
              <span className="text-primary">FAIR PLAY NOTICE:</span> ENGAGEMENT REWARDS ARE AI-MONITORED. VIOLATIONS LEAD TO PERMANENT VAULT SUSPENSION.
           </p>
        </div>
      </div>
    </div>
  );
}
