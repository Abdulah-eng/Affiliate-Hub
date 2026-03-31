"use client";

import React from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  BarChart2,
  Timer
} from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';

const HISTORY_DATA = [
  { name: 'John Dela Cruz', initial: 'JD', date: 'Oct 24, 2023 • 14:20', reviewer: 'Sarah Jenkins', status: 'Approved', color: 'emerald' },
  { name: 'Maria Leonila', initial: 'ML', date: 'Oct 24, 2023 • 13:45', reviewer: 'Michael Chen', status: 'Rejected', color: 'red' },
  { name: 'Antonio Santos', initial: 'AS', date: 'Oct 24, 2023 • 12:10', reviewer: 'Sarah Jenkins', status: 'Reupload', color: 'amber' },
  { name: 'Roberto Kalaw', initial: 'RK', date: 'Oct 23, 2023 • 17:55', reviewer: 'Alex Rivera', status: 'Approved', color: 'emerald' },
  { name: 'Liza Soberano', initial: 'LS', date: 'Oct 23, 2023 • 15:30', reviewer: 'Michael Chen', status: 'Approved', color: 'emerald' }
];

export default function ReviewHistoryPage() {
  return (
    <div className="animate-vapor">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">Operational Ledger</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
            Review <span className="text-primary tracking-normal">History</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-4">
            Comprehensive log of all KYC decisions and applicant status transitions within the Vault ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-4 bg-surface-container-high border border-outline-variant/30 text-on-surface-variant rounded-full hover:border-primary/50 hover:text-primary transition-all active:scale-95 font-black uppercase tracking-widest text-[10px]">
            <Filter size={16} /> Filter Results
          </button>
          <button className="flex items-center gap-2 px-8 py-4 bg-primary text-background rounded-full hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] transition-all active:scale-95 font-black uppercase tracking-widest text-[10px]">
            <Download size={16} /> Export Ledger
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <GlassCard className="p-8 border-primary/10 bg-surface-container-low/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <BarChart2 size={64} className="text-primary" />
          </div>
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Total Reviews Today</p>
          <div className="flex items-end gap-4">
            <h2 className="text-5xl font-black text-on-surface font-headline tracking-tighter">142</h2>
            <span className="text-emerald-400 text-xs font-black mb-2 uppercase tracking-widest">+12% VELOCITY</span>
          </div>
        </GlassCard>

        <GlassCard className="p-8 border-secondary/10 bg-surface-container-low/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck size={64} className="text-secondary" />
          </div>
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Approval Integrity</p>
          <div className="flex items-center gap-5">
            <h2 className="text-5xl font-black text-on-surface font-headline tracking-tighter">88.4%</h2>
            <div className="flex-1 max-w-[120px] h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5">
               <div className="bg-gradient-to-r from-primary to-secondary h-full w-[88%] rounded-full shadow-[0_0_10px_rgba(129,236,255,0.4)]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 border-tertiary/10 bg-surface-container-low/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Timer size={64} className="text-tertiary" />
          </div>
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Avg Processing Latency</p>
          <div className="flex items-end gap-4">
            <h2 className="text-5xl font-black text-on-surface font-headline tracking-tighter">4m 12s</h2>
            <span className="text-tertiary text-xs font-black mb-2 uppercase tracking-widest">-18s EFFICIENCY</span>
          </div>
        </GlassCard>
      </div>

      {/* History Table Section */}
      <GlassCard className="p-0 border-white/5 bg-surface-container-low/20 overflow-hidden shadow-2xl">
        <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
           <div>
              <h3 className="text-2xl font-black text-on-surface font-headline uppercase tracking-tight">Access Log</h3>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Real-time synchronization with the KYC Node.</p>
           </div>
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={16} />
              <input 
                placeholder="Search by operative name or Node ID..." 
                className="bg-slate-950/80 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium text-on-surface w-80 focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all outline-none"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-surface-container-high/40">
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Operative Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Sync Timestamp</th>
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Review Controller</th>
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Status Matrix</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {HISTORY_DATA.map((row, idx) => (
                <tr key={idx} className="group hover:bg-white/[0.03] transition-all duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-black text-xs text-primary border border-primary/20">
                        {row.initial}
                      </div>
                      <span className="font-black text-on-surface text-sm tracking-tight">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{row.date}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-xs font-black text-on-surface uppercase tracking-tight">{row.reviewer}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit",
                      row.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      row.color === 'red' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", row.color === 'emerald' ? "bg-emerald-400 animate-pulse" : row.color === 'red' ? "bg-red-400" : "bg-amber-400")} />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="text-primary hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 float-right group-hover:translate-x-1">
                      Deep Audit <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-10 py-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Displaying 1 to 5 of 1,284 entries</p>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-surface-container-high rounded-xl text-on-surface-variant hover:text-primary transition-all disabled:opacity-30" disabled>
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-xl bg-primary text-background font-black text-xs shadow-[0_0_15px_rgba(129,236,255,0.4)]">1</button>
              <button className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface font-black text-xs hover:bg-white/5 transition-all">2</button>
              <button className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface font-black text-xs hover:bg-white/5 transition-all">3</button>
            </div>
            <button className="p-3 bg-surface-container-high rounded-xl text-on-surface-variant hover:text-primary transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Flow Animation Footer */}
      <div className="mt-12 flex justify-center opacity-20">
         <div className="flex gap-8">
            <Zap size={24} className="text-primary animate-pulse" />
            <ShieldCheck size={24} className="text-primary animate-pulse [animation-delay:200ms]" />
            <History size={24} className="text-primary animate-pulse [animation-delay:400ms]" />
         </div>
      </div>
    </div>
  );
}
