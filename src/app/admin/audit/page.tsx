"use client";

import React, { useEffect, useState } from 'react';
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
  BarChart2,
  Loader2
} from "lucide-react";
import { cn } from '@/lib/utils';
import { getAuditLogs } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchLogs = async () => {
    setLoading(true);
    const data = await getAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = () => {
    fetchLogs();
    router.refresh();
  };

  const handleExport = () => {
    const headers = ["ID", "Operative", "Username", "Type", "Amount", "Status", "Date"];
    const rows = logs.map(tx => [
      tx.id,
      tx.user?.name || "Anonymous",
      tx.user?.username || "user",
      tx.type,
      tx.amount,
      tx.status,
      new Date(tx.createdAt).toLocaleString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

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
          <button 
            onClick={handleExport}
            className="bg-surface-container-high hover:bg-surface-bright text-on-surface px-6 py-4 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-outline-variant/30"
          >
            <Download size={16} /> Export CSV
          </button>
          <button 
            onClick={handleRefresh}
            className="bg-primary text-background px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] transition-all"
          >
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
          </div>
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1 ml-1">Total Audit Volume</p>
          <h3 className="text-3xl font-black font-headline text-on-surface tracking-tighter uppercase">{logs.reduce((acc, l) => acc + l.amount, 0).toLocaleString()} <span className="text-xs font-bold text-primary-variant/60 ml-1">PTS</span></h3>
        </GlassCard>

        <GlassCard className="p-6 rounded-2xl border-l-[6px] border-emerald-500 bg-emerald-500/[0.03]">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={24} />
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active Scan</span>
            </div>
          </div>
          <p className="text-[10px] font-black text-emerald-400/70 uppercase tracking-[0.2em] mb-1 ml-1">Synced Nodes</p>
          <h3 className="text-3xl font-black font-headline text-on-surface tracking-tighter uppercase">{logs.length} <span className="text-xs font-bold text-emerald-400 ml-1">EVENTS</span></h3>
        </GlassCard>
      </div>

      {/* Audit Table */}
      <GlassCard className="rounded-2xl p-0 overflow-hidden shadow-3xl bg-surface-container-low/20 border-white/5 mb-12">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-surface-container-highest/20 border-b border-white/5">
              <tr>
                <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Operative</th>
                <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Allocation Type</th>
                <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] text-right">Value</th>
                <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Status</th>
                <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Deployment Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((tx) => (
                <tr key={tx.id} className={cn(
                  "group transition-all duration-500 hover:bg-white/[0.03]",
                  tx.status === 'FLAGGED' ? "bg-red-500/[0.02]" : ""
                )}>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center border border-white/10 font-black text-xs text-primary">
                        {tx.user?.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-on-surface tracking-tight leading-tight">{tx.user?.name || 'Anonymous'}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1 opacity-60">@{tx.user?.username || 'user'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className={cn(
                      "flex items-center gap-2 text-[9px] font-black px-4 py-1.5 rounded-full border w-fit uppercase tracking-widest",
                      tx.type === 'REDEMPTION' ? "bg-tertiary/10 text-tertiary border-tertiary/20" : 
                      tx.type === 'REFERRAL' ? "bg-primary/10 text-primary border-primary/20" : 
                      "bg-secondary/10 text-secondary border-secondary/20"
                    )}>
                      {tx.type === 'CHAT' ? <MessageSquare size={12} /> : tx.type === 'REFERRAL' ? <Users size={12} /> : <Wallet size={12} />}
                      {tx.type}
                    </div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <span className="text-sm font-black text-on-surface tracking-widest">{tx.amount.toLocaleString()} PTS</span>
                  </td>
                  <td className="px-8 py-7">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest",
                      tx.status === 'FLAGGED' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      {tx.status === 'FLAGGED' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_#ef4444]"></span>}
                      {tx.status}
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="text-[10px] font-bold">
                      <p className="text-on-surface uppercase tracking-widest">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      <p className="text-on-surface-variant mt-1 opacity-50">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
