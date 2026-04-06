"use client";

import React, { useEffect, useState } from 'react';
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
  Timer,
  Loader2,
  RefreshCcw
} from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getReviewHistory } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export default function ReviewHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchHistory = async () => {
    setLoading(true);
    const data = await getReviewHistory();
    setHistory(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRefresh = () => {
    fetchHistory();
    router.refresh();
  };

  const handleExport = () => {
    const headers = ["Name", "Email", "Username", "KYC Status", "Reviewed At"];
    const rows = history.map(row => [
      row.name || "Anonymous",
      row.email || "N/A",
      row.username || "user",
      row.kycStatus,
      row.kycReviewedAt ? new Date(row.kycReviewedAt).toLocaleString() : "N/A"
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `review_history_${new Date().toISOString().split('T')[0]}.csv`);
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
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-6 py-4 bg-surface-container-high border border-outline-variant/30 text-on-surface-variant rounded-full hover:border-primary/50 hover:text-primary transition-all active:scale-95 font-black uppercase tracking-widest text-[10px]"
          >
            <RefreshCcw size={16} /> Sync KYC Node
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-background rounded-full hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] transition-all active:scale-95 font-black uppercase tracking-widest text-[10px]"
          >
            <Download size={16} /> Export Ledger
          </button>
        </div>
      </div>

      {/* History Table Section */}
      <GlassCard className="p-0 border-white/5 bg-surface-container-low/20 overflow-hidden shadow-2xl">
        <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
           <div>
              <h3 className="text-2xl font-black text-on-surface font-headline uppercase tracking-tight">Access Log</h3>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Real-time synchronization with the KYC Node.</p>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-surface-container-high/40">
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Operative Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Review Timestamp</th>
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Status Matrix</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((row, idx) => (
                <tr key={idx} className="group hover:bg-white/[0.03] transition-all duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-black text-xs text-primary border border-primary/20">
                        {row.name?.[0] || 'U'}
                      </div>
                      <span className="font-black text-on-surface text-sm tracking-tight">{row.name || 'Anonymous'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                        {row.kycReviewedAt ? new Date(row.kycReviewedAt).toLocaleString() : 'N/A'}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit",
                      row.kycStatus === 'APPROVED' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      row.kycStatus === 'REJECTED' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", row.kycStatus === 'APPROVED' ? "bg-emerald-400 animate-pulse" : row.kycStatus === 'REJECTED' ? "bg-red-400" : "bg-amber-400")} />
                      {row.kycStatus}
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
      </GlassCard>
    </div>
  );
}
