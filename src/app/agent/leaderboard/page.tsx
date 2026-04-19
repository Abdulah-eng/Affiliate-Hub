"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  Coins, 
  Zap, 
  Globe,
  Medal,
  ChevronRight
} from "lucide-react";
import { getLeaderboard } from "@/app/actions/leaderboard";
import { cn } from "@/lib/utils";

export default function AgentLeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    setLoading(true);
    const res = await getLeaderboard();
    if (res.success) setEntries(res.entries || []);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const categories = [
    { id: "TOP_PLAYERS", name: "Top Players", icon: <Users size={16} />, color: "text-primary", bgColor: "bg-primary/10" },
    { id: "TOP_VTO", name: "Top VTO", icon: <TrendingUp size={16} />, color: "text-secondary", bgColor: "bg-secondary/10" },
    { id: "TOP_COMMISSION", name: "Top Commission", icon: <Coins size={16} />, color: "text-tertiary", bgColor: "bg-tertiary/10" }
  ];

  const renderTable = (cat: any) => {
    const list = entries.filter(e => e.category === cat.id).sort((a,b) => a.rank - b.rank);
    return (
      <GlassCard key={cat.id} className="p-0 overflow-hidden border-white/5 bg-surface-container-low/20">
        <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg", cat.bgColor, cat.color)}>
            {cat.icon}
          </div>
          <h3 className="text-xl font-black text-on-surface uppercase tracking-tight italic">{cat.name}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] w-24">Rank</th>
                <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Operative</th>
                <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Volume / Status</th>
                <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] text-right">Brand Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {list.length === 0 ? (
                <tr>
                   <td colSpan={4} className="py-20 text-center text-on-surface-variant/40 font-black uppercase text-[10px] tracking-widest italic">
                     Establishing Network Connection...
                   </td>
                </tr>
              ) : (
                list.map((entry) => (
                  <tr key={entry.id} className="group hover:bg-white/[0.03] transition-all duration-500">
                    <td className="px-8 py-6">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border transition-transform group-hover:scale-110 duration-500 relative",
                        entry.rank === 1 ? "bg-primary text-background border-primary shadow-[0_0_20px_rgba(129,236,255,0.4)]" : 
                        entry.rank === 2 ? "bg-slate-800 text-secondary border-secondary/30" :
                        entry.rank === 3 ? "bg-slate-800 text-tertiary border-tertiary/30" :
                        "bg-white/5 text-on-surface-variant/50 border-white/5"
                      )}>
                        {entry.rank === 1 && <Medal size={12} className="absolute -top-1 -right-1 text-white animate-bounce" />}
                        {entry.rank}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center font-black text-xs text-primary uppercase">
                          {entry.name[0]}
                        </div>
                        <span className="font-black text-on-surface text-sm tracking-tight group-hover:text-primary transition-colors">{entry.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className={cat.color} />
                        <span className="text-xs font-black text-on-surface font-mono">{entry.value}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                         {entry.brandName || "N/A"}
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="animate-vapor space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20 flex items-center gap-2">
              <Trophy size={12} className="text-primary animate-pulse" /> Global Network Stats
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase italic leading-none">
            Kinetic <span className="text-primary tracking-normal not-italic">Ranking</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-6">
            Witness the elite performers of the Kinetic syndicate. Scale your performance to dominate the global standings.
          </p>
        </div>

        <GlassCard className="p-6 bg-primary/5 border-primary/20 flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-background shadow-[0_0_30px_rgba(129,236,255,0.4)]">
              <Zap size={30} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-primary tracking-widest">Your Status</p>
              <p className="text-2xl font-black text-on-surface uppercase tracking-tight">Standard Tier</p>
           </div>
           <ChevronRight className="text-on-surface-variant opacity-20 ml-4" />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
        {categories.map(cat => renderTable(cat))}
      </div>
    </div>
  );
}
