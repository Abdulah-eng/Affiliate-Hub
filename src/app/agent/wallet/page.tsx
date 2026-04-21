"use client";

import React, { useState, useEffect, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Wallet, 
  History, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Loader2,
  AlertTriangle,
  Zap,
  ShoppingBag,
  ExternalLink,
  Smartphone,
  MapPin,
  Trophy,
  X
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { getAgentWallet } from "@/app/actions/wallet";
import { getRedemptionProducts, submitRedemptionRequest } from "@/app/actions/redemptions";

const getImageUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `https://affiliatehubph.com${cleanUrl}`;
};

export default function AgentWalletPage() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({ pts: 0, gcash: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for redemption
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formInstruction, setFormInstruction] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [walletData, productData] = await Promise.all([
      getAgentWallet(),
      getRedemptionProducts()
    ]);

    if (walletData) {
      setBalance({ pts: walletData.totalPoints, gcash: walletData.totalGCash });
      setTransactions(walletData.transactions);
      setFormName(walletData.name || "");
      setFormPhone(walletData.mobileNumber || "");
      setFormUsername(walletData.username || "");
      setFormEmail(walletData.email || "");
    }

    if (productData.success) {
      setProducts(productData.products || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleClaim = () => {
    if (!selectedProduct) return;
    
    if (!formName || !formPhone || !formUsername || !formEmail) {
      setError("Please fill in all identity credentials.");
      return;
    }

    if (selectedProduct.type === "PRODUCT" && !formAddress) {
      setError("Shipping Address is required for physical rewards.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const res = await submitRedemptionRequest(selectedProduct.id, {
        name: formName,
        phone: formPhone,
        address: formAddress,
        username: formUsername,
        email: formEmail,
        instructions: formInstruction
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSelectedProduct(null);
          // Clear sensitive one-off instructions
          setFormInstruction("");
          fetchData();
        }, 3000);
      } else {
        setError(res.error || "Failed to submit request");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-primary mx-auto" size={48} />
          <p className="text-primary font-black uppercase tracking-[0.3em] text-xs">Accessing Kinetic Vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-vapor max-w-7xl mx-auto space-y-12 pb-20 px-4 md:px-0">
      {/* Header & Balance Cards */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20 flex items-center gap-2">
              <Zap size={12} className="text-primary animate-pulse" /> Extraction Terminal Active
            </span>
          </div>
          <h1 className="text-4xl lg:text-7xl font-black font-headline tracking-tighter text-on-surface uppercase italic leading-none">
            Kinetic <span className="text-primary tracking-normal not-italic">Wallet</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-6">
            Convert your hard-earned points into elite hardware, digital assets, or direct fiat liquidity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
           <GlassCard className="p-6 bg-primary/5 border-primary/20 relative overflow-hidden group min-w-0">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Wallet size={80} className="text-primary" />
              </div>
              <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Available Points</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-on-surface font-headline italic tracking-tighter">
                  {balance.pts.toLocaleString()}
                </h3>
                <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest">PTS</span>
              </div>
           </GlassCard>
           
           <GlassCard className="p-6 bg-emerald-500/5 border-emerald-500/20 relative overflow-hidden group min-w-0">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <ShoppingBag size={80} className="text-emerald-500" />
              </div>
              <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-1">GCash Credit</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-on-surface font-headline italic tracking-tighter">
                  {balance.gcash.toLocaleString()}
                </h3>
                <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest">PHP</span>
              </div>
           </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Store Area */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
             <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight flex items-center gap-3">
               <Trophy size={24} className="text-primary" /> Redemption Store
             </h2>
             <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant bg-white/5 px-4 py-1.5 rounded-full">
               {products.length} Items Available
             </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
              <GlassCard 
                key={product.id} 
                className="p-0 overflow-hidden group cursor-pointer hover:border-primary/40 transition-all flex flex-col"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="aspect-[4/3] relative bg-slate-900 overflow-hidden min-w-0">
                      {product.imageUrl ? (
                        <img 
                          src={getImageUrl(product.imageUrl)} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-primary/10 gap-2">
                          <ShoppingBag size={80} />
                          <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Kinetic Gear</span>
                        </div>
                      )}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-4 py-2 bg-slate-950/90 backdrop-blur-md rounded-xl text-sm font-black text-primary border border-primary/20 shadow-xl">
                      {product.pointsCost.toLocaleString()} PTS
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className={cn(
                         "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border",
                         product.type === "GCASH" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-primary/30 text-primary bg-primary/10"
                       )}>
                         {product.type}
                       </span>
                    </div>
                    <h3 className="text-xl font-black text-on-surface uppercase tracking-tight group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-sm text-on-surface-variant font-medium mt-2 line-clamp-2 leading-relaxed opacity-70">
                      {product.description}
                    </p>
                  </div>
                  
                  <button className="w-full py-3 bg-white/5 hover:bg-primary text-on-surface hover:text-background rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border border-white/10 group-hover:border-primary/50">
                    Redeem Item <ExternalLink size={14} />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Ledger Column */}
        <div className="lg:col-span-4 space-y-8">
           <GlassCard className="p-0 overflow-hidden flex flex-col h-[700px]">
              <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                     <History size={20} />
                   </div>
                   <h3 className="text-lg font-black text-on-surface uppercase tracking-tight">Ledger</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                {transactions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                     <History size={48} />
                     <p className="text-xs font-black uppercase tracking-[0.2em]">Transaction Logs Empty</p>
                  </div>
                ) : (
                  transactions.map((t) => {
                    const isPositive = t.amount > 0 && t.type !== "REDEMPTION" && t.status !== "PENDING";
                    let Icon = CheckCircle2;
                    let color = "text-emerald-400";
                    if (t.status === "PENDING") { Icon = Clock; color = "text-amber-400"; }
                    if (t.status === "REJECTED") { Icon = XCircle; color = "text-red-400"; }

                    return (
                      <div key={t.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-4">
                           <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", isPositive ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20")}>
                              <Icon size={16} className={color} />
                           </div>
                           <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-tight text-on-surface truncate">{t.type.replace(/_/g, ' ')}</p>
                              <p className="text-[9px] font-bold text-on-surface-variant/40 mt-1">{new Date(t.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className={cn("text-xs font-black font-mono", isPositive ? "text-emerald-400" : "text-on-surface")}>
                             {isPositive ? "+" : ""}{t.amount} {t.currency}
                           </p>
                           <span className={cn("text-[8px] font-black uppercase tracking-widest mt-1 inline-block", color)}>
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

      {/* Redemption Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
           <GlassCard className="max-w-2xl w-full p-0 overflow-hidden animate-vapor my-auto shadow-[0_0_100px_rgba(129,236,255,0.1)]">
              <div className="relative aspect-video bg-slate-900 border-b border-white/10 min-w-0">
                 {selectedProduct.imageUrl ? (
                   <img 
                     src={getImageUrl(selectedProduct.imageUrl)} 
                     alt={selectedProduct.name} 
                     className="w-full h-full object-cover" 
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-primary/10">
                     <ShoppingBag size={120} />
                   </div>
                 )}
                 <button 
                  onClick={() => { setSelectedProduct(null); setError(null); }}
                  className="absolute top-6 right-6 p-3 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white transition-all z-20"
                 >
                   <X size={20} />
                 </button>
                 <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                    <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded border border-primary/20">{selectedProduct.type}</span>
                    <h2 className="text-3xl font-black text-on-surface uppercase tracking-tight mt-2">{selectedProduct.name}</h2>
                 </div>
              </div>

              <div className="p-8 space-y-8">
                 <div className="flex items-center justify-between p-6 bg-primary/5 rounded-2xl border border-primary/20">
                    <div>
                       <p className="text-[10px] font-black uppercase text-primary tracking-widest">Protocol Cost</p>
                       <p className="text-2xl font-black text-on-surface font-mono">{selectedProduct.pointsCost.toLocaleString()} PTS</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Your Balance</p>
                       <p className={cn("text-2xl font-black font-mono", balance.pts >= selectedProduct.pointsCost ? "text-emerald-400" : "text-red-400")}>
                        {balance.pts.toLocaleString()} PTS
                       </p>
                    </div>
                 </div>

                 {success ? (
                   <div className="py-12 flex flex-col items-center text-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-emerald-500 text-background flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-bounce">
                        <CheckCircle2 size={40} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-tight">Request Transmitted</h3>
                        <p className="text-sm text-on-surface-variant font-medium mt-2">Our Nexus Admin will verify the extraction protocol shortly.</p>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant border-b border-white/5 pb-2">Verification Credentials</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Full Name</label>
                            <input 
                              type="text" 
                              value={formName}
                              onChange={e => setFormName(e.target.value)}
                              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 px-4 text-sm font-bold focus:border-primary outline-none transition-all"
                              placeholder="Full Name"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Phone / GCash Number</label>
                            <div className="relative">
                               <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                               <input 
                                type="text" 
                                value={formPhone}
                                onChange={e => setFormPhone(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm font-mono focus:border-primary outline-none transition-all"
                                placeholder="09XX XXX XXXX"
                               />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Your Affiliate Hub Username</label>
                            <input 
                              type="text" 
                              value={formUsername}
                              onChange={e => setFormUsername(e.target.value)}
                              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 px-4 text-sm font-bold focus:border-primary outline-none transition-all"
                              placeholder="Affiliate Hub Username"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
                            <input 
                              type="email" 
                              value={formEmail}
                              onChange={e => setFormEmail(e.target.value)}
                              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 px-4 text-sm font-bold focus:border-primary outline-none transition-all"
                              placeholder="Email Address"
                            />
                         </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Full Delivery Address (including city, province, ZIP code)</label>
                        <textarea 
                          value={formAddress}
                          onChange={e => setFormAddress(e.target.value)}
                          className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-medium focus:border-primary outline-none transition-all resize-none"
                          rows={2}
                          placeholder="Street, Barangay, City, Province, Zip Code"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Message / Instructions</label>
                        <textarea 
                          value={formInstruction}
                          onChange={e => setFormInstruction(e.target.value)}
                          className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-medium focus:border-primary outline-none transition-all resize-none"
                          rows={2}
                          placeholder="Any specific instructions for your reward..."
                        />
                      </div>

                      {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold animate-pulse">
                          <AlertTriangle size={18} /> {error}
                        </div>
                      )}

                      <button 
                        onClick={handleClaim}
                        disabled={balance.pts < selectedProduct.pointsCost || isPending}
                        className={cn(
                          "w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 shadow-2xl",
                          balance.pts >= selectedProduct.pointsCost 
                            ? "bg-[#ff9500] text-white hover:scale-[1.02] active:scale-[0.98] shadow-[#ff9500]/20" 
                            : "bg-white/5 text-on-surface-variant/20 border border-white/5 cursor-not-allowed"
                        )}
                      >
                        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                        {isPending ? "TRANSMITTING..." : "Claim My Reward"}
                      </button>
                   </div>
                 )}
              </div>
           </GlassCard>
        </div>
      )}
    </div>
  );
}
