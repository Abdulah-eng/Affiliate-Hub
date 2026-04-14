"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Wallet, 
  ArrowRightLeft, 
  History, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Loader2,
  AlertTriangle,
  Landmark,
  TrendingUp
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { requestWithdrawal } from "@/app/actions/payouts";
import { getAgentWallet } from "@/app/actions/wallet";

export default function AgentWalletPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({ pts: 0, gcash: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  const [amount, setAmount] = useState<number>(100);
  const [paymentMethod, setPaymentMethod] = useState("GCash");
  const [paymentDetails, setPaymentDetails] = useState("");

  const fetchData = async () => {
    setLoading(true);
      const data = await getAgentWallet();
      if (data) {
        setBalance({
          pts: data.totalPoints,
          gcash: data.totalGCash
        });
        setTransactions(data.transactions);
        if (data.mobileNumber && !paymentDetails) {
          setPaymentDetails(data.mobileNumber);
        }
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 100) {
      setError("Minimum withdrawal is 100 PTS.");
      return;
    }
    if (amount > balance.pts + balance.gcash) {
      setError("Insufficient balance.");
      return;
    }
    if (!paymentDetails || paymentDetails.length < 5) {
      setError("Invalid payment details.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const res = await requestWithdrawal(amount, paymentMethod, paymentDetails);
    setSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setAmount(100);
      setPaymentDetails("");
      fetchData(); // refresh data
      setTimeout(() => setSuccess(false), 5000);
    } else {
      setError((res as any).error || "Failed to submit request");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const pendingWithdrawals = transactions.filter(t => t.type === "WITHDRAWAL_HOLD" && t.status === "PENDING");

  return (
    <div className="animate-vapor max-w-5xl mx-auto space-y-10">
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-black font-headline text-on-surface tracking-tight uppercase italic relative inline-block">
          Asset <span className="text-primary not-italic tracking-normal">Extraction</span>
        </h2>
        <p className="text-on-surface-variant font-medium mt-2">
          Convert your kinetic points into real-world fiat liquidity across integrated finance providers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Request Form & Stats */}
        <div className="lg:col-span-7 space-y-8">
          <GlassCard className="p-8 border-primary/20 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuCHmXfJscU8CByK3tqYyM9eYOn-f5hIEx3Kz1G_W5e6J6wVn6z1n6wVn6z1n6wVn6z1n6wVn6z1')] bg-cover relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(129,236,255,0.15)] transition-all">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-0"></div>
            <div className="absolute -right-10 top-0 opacity-10 rotate-12 group-hover:scale-125 transition-transform duration-1000 z-0 text-primary">
              <Wallet size={160} />
            </div>
            
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 backdrop-blur-md">
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-primary mb-1">POINTS WALLET</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-on-surface font-headline tracking-tighter">
                    {balance.pts.toLocaleString()}
                  </h3>
                  <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest">PTS</span>
                </div>
              </div>

              <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 backdrop-blur-md relative overflow-hidden group/gcash">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/gcash:scale-110 transition-transform">
                   <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-emerald-500 mb-1">GCASH CREDIT</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-on-surface font-headline tracking-tighter">
                    {balance.gcash.toLocaleString()}
                  </h3>
                  <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest">PHP</span>
                </div>
              </div>
              
              {pendingWithdrawals.length > 0 && (
                <div className="sm:col-span-2 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl flex items-center gap-3 self-start">
                  <Clock size={16} className="text-amber-400 animate-pulse shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase font-black tracking-widest text-amber-500">Extraction Pending Audit</p>
                    <p className="text-sm font-bold text-amber-400 mt-0.5">
                       {pendingWithdrawals.reduce((sum, t) => sum + t.amount, 0).toLocaleString()} PTS / GCASH
                    </p>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleWithdraw} className="relative z-10 space-y-6 flex flex-col bg-slate-900/50 p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRightLeft size={16} className="text-primary" />
                <h4 className="text-sm font-black uppercase tracking-tight text-on-surface">Extraction Protocol</h4>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Amount to Convert (Min 100 PTS)</label>
                <div className="flex bg-surface-container-low rounded-xl overflow-hidden border border-white/10 focus-within:border-primary transition-colors">
                  <span className="pl-4 py-3 text-sm font-bold text-on-surface-variant/50">PTS</span>
                  <input 
                    type="number" 
                    min="100" 
                    max={balance.pts + balance.gcash} 
                    value={amount} 
                    onChange={e => setAmount(Number(e.target.value))} 
                    className="w-full bg-transparent border-none py-3 px-3 text-sm font-mono font-black text-on-surface outline-none"
                  />
                  <button type="button" onClick={() => setAmount(balance.pts + balance.gcash)} className="px-4 py-3 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-primary transition-colors border-l border-white/5">
                    MAX
                  </button>
                </div>
                {amount >= 100 && (
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2 px-1 flex items-center gap-2">
                    <TrendingUp size={12} /> Expected Credit: ≈ {Math.floor(amount / (settings['POINTS_TO_GCASH_RATE'] ? parseInt(settings['POINTS_TO_GCASH_RATE']) : 10))} PHP GCash
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Method</label>
                  <div className="relative">
                    <Landmark size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <select 
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full bg-surface-container-low border border-white/10 rounded-xl py-3 pl-9 pr-4 text-sm font-bold text-on-surface outline-none focus:border-primary appearance-none cursor-pointer"
                    >
                      <option value="GCash">GCash</option>
                      <option value="Maya">Maya</option>
                      <option value="GoTyme Bank">GoTyme Bank</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Account Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 09XX XXX XXXX"
                    value={paymentDetails}
                    onChange={e => setPaymentDetails(e.target.value)}
                    className="w-full bg-surface-container-low border border-white/10 rounded-xl py-3 px-4 text-sm font-mono focus:border-primary outline-none transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-3 text-red-400 text-xs font-bold">
                  <AlertTriangle size={14} className="shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-3 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 size={14} className="shrink-0" /> Request submitted to Nexus Admin for review.
                </div>
              )}

              <button 
                type="submit" 
                disabled={submitting || (balance.pts + balance.gcash) < 100}
                className="w-full bg-primary text-slate-950 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(129,236,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : "Initiate Extraction"}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Side: Ledger */}
        <div className="lg:col-span-5 h-[600px] flex flex-col">
          <GlassCard className="h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center gap-3 shrink-0 bg-surface-container-low/50">
              <History size={18} className="text-on-surface-variant" />
              <h3 className="font-headline font-black text-on-surface uppercase tracking-tight text-lg">Transaction Ledger</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
              {transactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <History size={32} className="mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Ledger Empty</p>
                </div>
              ) : (
                transactions.map((t) => {
                  const isPositive = t.amount > 0 && t.type !== "WITHDRAWAL_HOLD" && t.type !== "REDEMPTION";
                  
                  let StatusIcon = CheckCircle2;
                  let statusColor = "text-emerald-400";
                  if (t.status === "PENDING") { StatusIcon = Clock; statusColor = "text-amber-400"; }
                  if (t.status === "REJECTED" || t.status === "FLAGGED") { StatusIcon = XCircle; statusColor = "text-red-400"; }

                  return (
                    <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container border border-white/5 hover:bg-white/[0.03] transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", isPositive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
                          <StatusIcon size={16} className={statusColor} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight text-on-surface">{t.type.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] font-bold text-on-surface-variant/50 max-w-[150px] truncate">{t.description || "System transaction"}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 mt-1">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-sm font-black font-mono", isPositive || t.status === "REJECTED" ? "text-emerald-400" : "text-on-surface")}>
                          {isPositive || t.status === "REJECTED" ? "+" : "-"}{t.amount} {t.currency || 'PTS'}
                        </p>
                        <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border mt-1 inline-block",
                          t.status === "COMPLETED" ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10" :
                          t.status === "PENDING" ? "border-amber-500/30 text-amber-500 bg-amber-500/10" :
                          "border-red-500/30 text-red-500 bg-red-500/10"
                        )}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </div>
        
      </div>
    </div>
  );
}
