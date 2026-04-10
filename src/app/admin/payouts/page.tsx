"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Landmark, 
  Check, 
  X, 
  Clock, 
  AlertTriangle, 
  Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { processWithdrawal } from "@/app/actions/payouts";

// For realistic UI we would fetch from a new admin action `getPendingWithdrawals`
// But we will quickly make a call to fetch them.
// Let's create an inline fetch or assume we have it. 
// I'll add an action in `admin.ts` or `payouts.ts` for getPendingWithdrawals.

// TEMPORARY: fetch them directly via a server action we will add to payouts.ts
import { getWithdrawalsAdmin } from "@/app/actions/payouts";

export default function AdminPayoutsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    const data = await getWithdrawalsAdmin();
    setWithdrawals(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleProcess = async (id: string, action: "APPROVED" | "REJECTED") => {
    let notes = "";
    let proofUrl = "";

    if (action === "REJECTED") {
      notes = prompt("Reason for rejection?") || "Failed validation.";
      if (!notes) return;
    } else {
      proofUrl = prompt("Enter Payment Proof Image URL (Required for Approval):") || "";
      if (!proofUrl) {
        alert("Payment proof URL is required for approval.");
        return;
      }
    }
    
    setProcessingId(id);
    const res = await processWithdrawal(id, action, notes, proofUrl);
    setProcessingId(null);
    if (res.success) {
      fetchWithdrawals();
    } else {
      alert("Error: " + (res as any).error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const pending = withdrawals.filter(w => w.status === "PENDING");
  const history = withdrawals.filter(w => w.status !== "PENDING");

  return (
    <div className="animate-vapor max-w-6xl mx-auto space-y-10">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">Liquidity Console</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
          Asset <span className="text-primary tracking-normal">Extraction</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-4">
          Review and securely process agent asset withdrawal requests.
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-headline font-black text-on-surface uppercase tracking-tight flex items-center gap-3">
          <Clock size={20} className="text-amber-400" /> Pending Requests ({pending.length})
        </h3>
        
        {pending.length === 0 ? (
          <GlassCard className="p-12 flex flex-col items-center justify-center text-on-surface-variant/40 border-dashed">
            <Landmark size={48} className="mb-4 opacity-20" />
            <p className="font-black uppercase tracking-widest text-sm">No Pending Requests</p>
            <p className="text-xs font-bold mt-2 opacity-60">All extractions have been processed.</p>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {pending.map(w => (
              <GlassCard key={w.id} className="p-6 border-l-4 border-amber-500 overflow-hidden relative group">
                {processingId === w.id && (
                  <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-20 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={24} />
                  </div>
                )}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex gap-6 items-center">
                    <div className="w-14 h-14 bg-surface-container-high rounded-full overflow-hidden shrink-0 border border-white/10">
                       <img src={w.user.image || `https://ui-avatars.com/api/?name=${w.user.name}&background=1e293b&color=81ecff`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-on-surface uppercase tracking-tight">{w.user.name} <span className="text-primary">({w.user.username})</span></p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1">Requested: {new Date(w.createdAt).toLocaleString()}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono">{w.paymentMethod}</span>
                        <span className="text-sm font-mono tracking-widest text-on-surface">{w.paymentDetails}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 bg-surface-container-low p-4 rounded-2xl border border-white/5">
                    <div>
                      <p className="text-[9px] uppercase font-black tracking-[0.2em] text-on-surface-variant">Amount</p>
                      <p className="text-2xl font-black font-mono text-emerald-400">{w.amount}</p>
                    </div>
                    
                    <div className="h-10 w-[1px] bg-white/10"></div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleProcess(w.id, "APPROVED")}
                        className="p-3 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-500 rounded-xl transition-colors border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                        title="Approve & Send"
                      >
                        <Check size={20} />
                      </button>
                      <button 
                        onClick={() => handleProcess(w.id, "REJECTED")}
                        className="p-3 bg-red-500/10 hover:bg-red-500 hover:text-slate-950 text-red-500 rounded-xl transition-colors border border-red-500/20"
                        title="Reject & Refund"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 pt-10">
        <h3 className="text-sm font-headline font-black text-on-surface-variant uppercase tracking-[0.2em]">
          Processed History
        </h3>
        
        <div className="grid gap-3">
          {history.length === 0 ? (
            <p className="text-xs text-on-surface-variant/50">No history available.</p>
          ) : (
            history.map(w => (
              <div key={w.id} className="p-4 rounded-xl border border-white/5 bg-surface-container-low/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-4 items-center">
                  <div className={cn("w-2 h-2 rounded-full", w.status === "APPROVED" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500 shadow-[0_0_8px_#ef4444]")}></div>
                  <div className="flex items-center gap-3">
                    {w.proofUrl && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                        <img src={w.proofUrl} alt="Proof" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-on-surface">{w.user.name}</p>
                      <p className="text-[10px] text-on-surface-variant tracking-widest">{w.paymentMethod} • {new Date(w.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-black">{w.amount} PTS</p>
                  <p className={cn("text-[9px] uppercase font-black tracking-widest", w.status === "APPROVED" ? "text-emerald-500" : "text-red-500")}>
                    {w.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
