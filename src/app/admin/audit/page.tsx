"use client";

import React from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Database, 
  TrendingUp, 
  AlertTriangle, 
  Wallet, 
  ShieldCheck, 
  Download, 
  RefreshCcw, 
  Search, 
  Filter, 
  Eye, 
  Flag,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Users,
  BrainCircuit,
  Zap,
  BarChart2
} from "lucide-react";
import { cn } from '@/lib/utils';
import Image from 'next/image';

const TRANSACTIONS = [
  { 
    id: '#KV-82910', 
    user: 'Marcus Chen', 
    handle: 'marcus_vault', 
    type: 'Redemption', 
    amount: '50,000', 
    status: 'Flagged', 
    time: 'Oct 24, 2023 14:22',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUTwjdHiFq2D1svjvvUqIEc5HP8fOeygORhaIdpDmS95BOeA28NNHlZsZSy6Ku3btQXHVgBYXT1jPYyA3SqAy60k6fpxLTDRgo8-uH7d1oqPDMd25bLLhS5ISv2YoR_Q7qhtiHhPNaFmAn5jryDAK5nyweDirQQsmfKcKt-j0yDwx53ToTpNDRKlppB9Ry4UERQ_Ar5_zC8-hcxvcJWQBxNHx_Z7KT8IK0SuU78_Ft4spsQIeA0ZlmyhLWQ4z4CMj2l631bigJDQs' 
  },
  { 
    id: '#KV-82909', 
    user: 'Sarah Lopez', 
    handle: 'slopez_77', 
    type: 'Referral', 
    amount: '2,500', 
    status: 'Completed', 
    time: 'Oct 24, 2023 14:15',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcWPEGGCHwL-39FipYpu4PpqW2ziBGQ0ekkfsiMmak3hfMLwYbjf8U_zyN_B5ZLv3H648oBEl0kffBwcYN7v-PsZlIpYGbxoUZ-ZaUv7015BAuv01Ynj3WxCGoFt1y2n_q4TybJWYkkFZiayfnIfJbrevM78p3DT3Q48L41lFaWvA0gmDTzT0EEMc_OT1MOyTJcwetYK1FZIufcOrb_tTDW4gJdUMpcUNQGR1jHiUK8WeeyAOPJozQ5Yur6AqE7poQ6dGooSXmbpo' 
  },
  { 
    id: '#KV-82908', 
    user: 'James Wilson', 
    handle: 'wilson_j', 
    type: 'Chat Bonus', 
    amount: '450', 
    status: 'Completed', 
    time: 'Oct 24, 2023 14:02',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgyIo_Oyvf26r9O_F0ockdVnyCPn3c8khcse13tLUKHnNRD6pjTPO0-4c9AmlkvIqL5mQIwqqvmnNV4sxeG84pUnia4CTMLrQJr_EO3yK_hnpRYRtiqmE3RNof4auVzGOFZgH6k-ipPVTwSk04tgLPj-v_jc0inaRmaj2LTYLNv3nyi2F23Al49_5ujabxMiQ_Tk7zrYYaJAT2S81ViK8kAzmzOd84BEfvGUo82VwxFUc4slRPtAVR0wn2LDCmrM7xs5lFvlZINA8' 
  },
  { 
    id: '#KV-82907', 
    user: 'Alex Rivera', 
    handle: 'arivera_vault', 
    type: 'Redemption', 
    amount: '78,450', 
    status: 'Flagged', 
    time: 'Oct 24, 2023 13:58',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUBWh_SaFvdSzefLISaZK3haodYitrJNsad8GxyWbnD-K4P0bVJmhSmdNKk6pkc2jcOF6oDHqTeMGKeNbeZmv9_y2WMD3G3vGaeWvYW9sMjSrO4HcLjw9wweDWMgehkhOdu34zkGNO9wiKQm27Y6ZbGojYz5FDxozulEAeX9jk7PFsAO9N0srftTZHN-JigXPsVxXGVP3Qj9jrN79HyBWx8wVQNn-pBjt5Dd6R-NboPNtMDBXAh7EwsGKEEUTaJdPRmMoQxXEYvrE' 
  }
];

export default function AuditLogPage() {
  return (
    <div className="animate-vapor">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase">
            Points <span className="text-primary">Audit Log</span>
          </h1>
          <p className="text-on-surface-variant max-w-lg text-lg font-medium leading-relaxed">Real-time ledger of all point transactions and redemption activities across the kinetic network.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-surface-container-high hover:bg-surface-bright text-on-surface px-6 py-4 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-outline-variant/30">
            <Download size={16} /> Export CSV
          </button>
          <button className="bg-primary text-background px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] transition-all">
            <RefreshCcw size={16} /> Refresh Ledger
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <GlassCard className="p-6 rounded-2xl border-l-[6px] border-primary bg-surface-container-low/40">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <Database size={24} />
            </div>
            <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">+12.4%</span>
          </div>
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1 ml-1">Total Audit Volume</p>
          <h3 className="text-3xl font-black font-headline text-on-surface tracking-tighter uppercase">4,821,092 <span className="text-xs font-bold text-primary-variant/60 ml-1">PTS</span></h3>
        </GlassCard>

        <GlassCard className="p-6 rounded-2xl border-l-[6px] border-red-500 bg-red-500/[0.03] shadow-[0_20px_40px_rgba(255,113,108,0.05)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-5 group-hover:scale-125 transition-transform duration-700">
            <AlertTriangle size={140} className="text-red-500" />
          </div>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-red-500/10 rounded-2xl text-red-400 border border-red-500/20">
              <ShieldCheck size={24} />
            </div>
            <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
              <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Audit Required</span>
            </div>
          </div>
          <p className="text-[10px] font-black text-red-400/70 uppercase tracking-[0.2em] mb-1 ml-1">Points Flagged</p>
          <h3 className="text-3xl font-black font-headline text-on-surface tracking-tighter uppercase">128,450 <span className="text-xs font-bold text-red-400 ml-1">PTS</span></h3>
        </GlassCard>

        <GlassCard className="p-6 rounded-2xl border-l-[6px] border-tertiary bg-surface-container-low/40">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-tertiary/10 rounded-2xl text-tertiary border border-tertiary/20">
              <Wallet size={24} />
            </div>
            <span className="text-[10px] font-black text-tertiary px-3 py-1 bg-tertiary/10 rounded-full border border-tertiary/20 uppercase">In Flow</span>
          </div>
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1 ml-1">Pending Cashouts</p>
          <h3 className="text-3xl font-black font-headline text-on-surface tracking-tighter uppercase">₱24,190.00</h3>
        </GlassCard>

        <GlassCard className="p-6 rounded-2xl border-l-[6px] border-secondary bg-surface-container-low/40">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-secondary/10 rounded-2xl text-secondary border border-secondary/20">
              <Zap size={24} />
            </div>
            <span className="text-[10px] font-black text-secondary px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20 uppercase tracking-widest">98.2%</span>
          </div>
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1 ml-1">Vault Integrity</p>
          <div className="w-full bg-surface-container-high h-2 rounded-full mt-4 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary w-[98.2%] rounded-full shadow-[0_0_10px_#81ecff]"></div>
          </div>
        </GlassCard>
      </div>

      {/* Ledger Sorting Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-6 py-3 rounded-full bg-primary text-background text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(129,236,255,0.2)]">All Activity</button>
          <button className="px-6 py-3 rounded-full bg-surface-container-high/40 text-on-surface-variant hover:text-on-surface text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5">Redemptions</button>
          <button className="px-6 py-3 rounded-full bg-surface-container-high/40 text-on-surface-variant hover:text-on-surface text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5">Referrals</button>
          <button className="px-6 py-3 rounded-full bg-surface-container-high/40 text-on-surface-variant hover:text-on-surface text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5">Chat Bonus</button>
          <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block"></div>
          <button className="px-6 py-3 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-red-500/20 transition-all">
            <Flag size={14} /> Flagged Transactions
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={16} />
            <input className="bg-surface-container-low border border-outline-variant/30 focus:border-primary/50 text-sm rounded-2xl py-3 pl-12 pr-6 w-72 transition-all outline-none" placeholder="Search ledger..." type="text"/>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <GlassCard className="rounded-2xl p-0 overflow-hidden shadow-3xl bg-surface-container-low/20 border-white/5 mb-12">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-surface-container-highest/20 border-b border-white/5">
              <tr>
                <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Transaction Node</th>
                <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Operative</th>
                <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Allocation Type</th>
                <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] text-right">Value</th>
                <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Status</th>
                <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Deployment Time</th>
                <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className={cn(
                  "group transition-all duration-500 hover:bg-white/[0.03]",
                  tx.status === 'Flagged' ? "bg-red-500/[0.02]" : ""
                )}>
                  <td className="px-8 py-7">
                    <span className={cn(
                      "font-mono text-xs font-bold uppercase tracking-widest",
                      tx.status === 'Flagged' ? "text-red-400" : "text-primary"
                    )}>{tx.id}</span>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                        <img src={tx.avatar} alt={tx.user} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-on-surface tracking-tight leading-tight">{tx.user}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1 opacity-60">@{tx.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className={cn(
                      "flex items-center gap-2 text-[9px] font-black px-4 py-1.5 rounded-full border w-fit uppercase tracking-widest",
                      tx.type === 'Redemption' ? "bg-tertiary/10 text-tertiary border-tertiary/20" : 
                      tx.type === 'Referral' ? "bg-primary/10 text-primary border-primary/20" : 
                      "bg-secondary/10 text-secondary border-secondary/20"
                    )}>
                      {tx.type === 'Chat Bonus' ? <MessageSquare size={12} /> : tx.type === 'Referral' ? <Users size={12} /> : <Wallet size={12} />}
                      {tx.type}
                    </div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <span className="text-sm font-black text-on-surface tracking-widest">{tx.amount} PTS</span>
                  </td>
                  <td className="px-8 py-7">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest",
                      tx.status === 'Flagged' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      {tx.status === 'Flagged' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_#ef4444]"></span>}
                      {tx.status}
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="text-[10px] font-bold">
                      <p className="text-on-surface uppercase tracking-widest">{tx.time.split(' ')[0]} {tx.time.split(' ')[1]}</p>
                      <p className="text-on-surface-variant mt-1 opacity-50">{tx.time.split(' ')[2]}</p>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center justify-center gap-3">
                      <button className="p-3 rounded-xl hover:bg-white/10 text-on-surface-variant hover:text-primary transition-all"><Eye size={18} /></button>
                      <button className={cn(
                        "p-3 rounded-xl transition-all",
                        tx.status === 'Flagged' ? "bg-red-500 text-background shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "hover:bg-red-500/10 text-on-surface-variant hover:text-red-400"
                      )}>
                        <Flag size={18} className={cn(tx.status === 'Flagged' && "fill-current")} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Table Footer / Pagination */}
        <div className="px-8 py-6 bg-surface-container-high/30 border-t border-white/5 flex items-center justify-between">
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Showing <span className="text-on-surface">01-10</span> of <span className="text-on-surface">452</span> entries</p>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-surface-container-high border border-white/10 text-on-surface-variant hover:text-primary transition-all">
              <ChevronLeft size={16} />
            </button>
            {[1, 2, 3].map((i) => (
              <button key={i} className={cn(
                "w-10 h-10 rounded-xl font-black text-xs transition-all border",
                i === 1 ? "bg-primary/10 text-primary border-primary/20" : "bg-surface-container-high border-white/10 text-on-surface-variant hover:text-on-surface"
              )}>{i}</button>
            ))}
            <span className="px-2 opacity-30">...</span>
            <button className="w-10 h-10 rounded-xl bg-surface-container-high border border-white/10 text-on-surface-variant font-black text-xs">45</button>
            <button className="p-2.5 rounded-xl bg-surface-container-high border border-white/10 text-on-surface-variant hover:text-primary transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Visual Analytics & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <GlassCard className="lg:col-span-2 p-10 rounded-3xl bg-surface-container-low/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
            <BarChart2 size={160} className="text-primary" />
          </div>
          <h3 className="text-xl font-black font-headline text-on-surface uppercase tracking-tight mb-10 flex items-center gap-4 relative z-10">
            <TrendingUp className="text-primary" size={24} />
            Audit Frequency Trend
          </h3>
          <div className="h-64 flex items-end justify-between gap-6 px-4 border-b border-white/5 relative z-10">
            {[40, 55, 100, 45, 30, 60, 50].map((h, i) => (
              <div key={i} className="flex-1 bg-surface-container-high/40 rounded-t-2xl relative group/bar hover:bg-primary/5 transition-all duration-500">
                <div className={cn(
                  "absolute inset-x-0 bottom-0 rounded-t-2xl transition-all duration-1000",
                  h === 100 ? "bg-red-500/30 neon-glow-error h-[90%]" : "bg-primary/20 group-hover/bar:bg-primary/40 h-[var(--h)]"
                )} style={{'--h': `${h}%`} as any}></div>
                {h === 100 && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-background text-[10px] px-3 py-1.5 rounded-lg font-black whitespace-nowrap shadow-xl animate-bounce">SPIKE DETECTED</div>
                )}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-surface-bright text-[10px] px-3 py-1.5 rounded-lg font-bold border border-white/10">{h * 100} PTS</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 px-6">
            <span>Mon</span><span>Tue</span><span className="text-red-400 font-black">Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </GlassCard>

        <GlassCard className="p-10 rounded-3xl border-l-[8px] border-red-500 bg-red-500/[0.01] flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-5 mb-10">
              <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all">
                <BrainCircuit size={32} />
              </div>
              <div>
                <h4 className="font-black text-on-surface uppercase tracking-tight text-lg">Auto-Audit Engine</h4>
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1">Status: Scanning Nodes</p>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-8 font-medium">
              The neural processor has flagged <span className="text-red-400 font-black">14 new redemptions</span> for manual review based on suspicious chat-point conversion ratios.
            </p>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">Ratio Anomaly</span>
                  <span className="text-[10px] font-black text-red-400 uppercase">High Risk</span>
                </div>
                <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[85%] shadow-[0_0_10px_#ef4444]"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">Velocity Check</span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase">Optimal</span>
                </div>
                <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[30%] shadow-[0_0_10px_#10b981]"></div>
                </div>
              </div>
            </div>
          </div>
          <button className="mt-12 w-full bg-red-500 text-background py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all active:scale-[0.98]">
            Initial Global Risk Scan
          </button>
        </GlassCard>
      </div>

    </div>
  );
}
