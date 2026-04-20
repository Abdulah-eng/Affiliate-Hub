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
    { id: "TOP_VTO", name: "ELITE VTO LEADERS", icon: <TrendingUp size={18} className="text-orange-500" />, emoji: "🔥" },
    { id: "TOP_PLAYERS", name: "TOP PLAYER SIGN UPS", icon: <Zap size={18} className="text-yellow-400" />, emoji: "⚡" },
    { id: "TOP_COMMISSION", name: "HIGH COMMISSION AGENTS", icon: <Coins size={18} className="text-emerald-400" />, emoji: "💰" }
  ];

  const formatValue = (val: string) => {
    // If it's already formatted (like 1.6M), return it
    if (val.includes('M') || val.includes('K')) return val;
    
    // Otherwise try to format it from number
    const num = parseFloat(val.replace(/[$,]/g, ''));
    if (isNaN(num)) return val;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return val;
  };

  const renderCard = (cat: any) => {
    const list = entries.filter(e => e.category === cat.id).sort((a,b) => a.rank - b.rank);
    return (
      <GlassCard key={cat.id} className="flex-1 min-w-[320px] bg-[#0c1a36]/60 border-primary/20 p-8 flex flex-col gap-8 shadow-[0_30px_60px_rgba(37,99,235,0.1)] relative group overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center gap-4 relative z-10 border-b border-white/5 pb-6">
           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/40 transition-all duration-500">
              {cat.icon}
           </div>
           <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.15em]">{cat.name}</h3>
        </div>

        {/* Content Section */}
        <div className="space-y-4 relative z-10 flex-1">
          {list.length === 0 ? (
            <div className="py-12 text-center text-[10px] font-black text-on-surface-variant uppercase tracking-widest italic opacity-40">
              Syncing Feed...
            </div>
          ) : (
            list.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between group/item">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border transition-all",
                    entry.rank === 1 ? "bg-amber-400/20 text-amber-400 border-amber-400/40" :
                    entry.rank === 2 ? "bg-slate-400/20 text-slate-400 border-slate-400/40" :
                    entry.rank === 3 ? "bg-amber-700/20 text-amber-700 border-amber-700/40" :
                    "bg-white/5 text-on-surface-variant border-white/5"
                  )}>
                    {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                  </div>
                  <span className="text-xs font-black text-on-surface group-hover/item:text-primary transition-colors uppercase tracking-tight truncate max-w-[120px]">
                    {entry.userId}
                  </span>
                </div>
                <div className="text-sm font-black text-white font-mono tracking-tighter">
                   {formatValue(entry.ggrValue)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Link */}
        <div className="pt-6 border-t border-white/5 flex justify-end">
           <button className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
              Full Standings <ChevronRight size={14} />
           </button>
        </div>

        {/* Decorative BG element */}
        <div className="absolute -bottom-10 -right-10 text-8xl opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none grayscale group-hover:grayscale-0 scale-150 group-hover:scale-100 transition-all duration-1000">
           {cat.emoji}
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
              <Trophy size={12} className="text-primary animate-pulse" /> Affiliate Performance Stats
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic leading-none">
            Affiliate Hub Ph <span className="text-primary tracking-normal not-italic">Ranking</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-6">
            Discover top-performing affiliates across the network. Track your progress and climb the leaderboard with real results.
          </p>
        </div>

        <GlassCard className="p-6 bg-primary/5 border-primary/20 flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-background shadow-[0_0_30px_rgba(129,236,255,0.4)]">
              <Zap size={30} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-primary tracking-widest">Your Status</p>
              <p className="text-2xl font-black text-on-surface uppercase tracking-tight">Active Operative</p>
           </div>
           <ChevronRight className="text-on-surface-variant opacity-20 ml-4" />
        </GlassCard>
      </div>

      <div className="flex flex-wrap gap-8 items-stretch">
        {categories.map(cat => renderCard(cat))}
      </div>
    </div>
  );
}
