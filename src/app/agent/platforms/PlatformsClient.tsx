"use client";

import React, { useState, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Rocket, 
  Search, 
  Plus, 
  Check, 
  Hourglass, 
  ShieldAlert, 
  ChevronRight,
  Globe,
  Loader2,
  Sparkles,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { applyForPlatform } from "@/app/actions/platforms";

type Brand = {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  status: string; // AVAILABLE, PENDING, APPROVED, REJECTED
};

type Props = {
  brands: Brand[];
  kycStatus: string;
};

export default function PlatformsClient({ brands, kycStatus }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApply = (brandId: string) => {
    if (kycStatus !== "APPROVED") {
      setFeedback({ type: 'error', msg: "KYC Approval required to request new platforms." });
      return;
    }

    startTransition(async () => {
      const res = await applyForPlatform(brandId);
      if (res.success) {
        setFeedback({ type: 'success', msg: "Application submitted successfully!" });
      } else {
        setFeedback({ type: 'error', msg: res.error || "Failed to submit request." });
      }
    });
  };

  return (
    <div className="animate-vapor space-y-12 pb-20">
      {feedback && (
        <div className={cn(
          "fixed top-10 right-10 z-[100] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl animate-vapor border",
          feedback.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
        )}>
          {feedback.msg}
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-secondary/20">Discovery Terminal</span>
             {kycStatus !== 'APPROVED' && (
               <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-amber-500/20 flex items-center gap-2">
                 <Lock size={10} /> KYC Required
               </span>
             )}
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
            Brand <span className="text-secondary tracking-normal">Nexus</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg font-medium">
            Scale your operations across the network. Discover and request credentials for premium partner platforms.
          </p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors" size={20} />
          <input 
            className="w-full bg-surface-container-low border border-outline-variant/30 focus:border-secondary/50 p-4 pl-12 rounded-2xl outline-none text-on-surface transition-all font-bold placeholder:text-on-surface-variant/40"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBrands.map((brand) => {
          const isPendingReq = brand.status === "PENDING";
          const isApproved = brand.status === "APPROVED";
          const isRejected = brand.status === "REJECTED";
          const isAvailable = brand.status === "AVAILABLE";

          return (
            <GlassCard 
              key={brand.id} 
              className={cn(
                "p-8 group relative overflow-hidden transition-all duration-500 flex flex-col h-full hover:-translate-y-2",
                isApproved ? "border-emerald-500/20" : isPendingReq ? "border-amber-500/20" : "border-white/5 hover:border-secondary/40"
              )}
            >
              <div className="absolute -top-10 -right-10 p-10 opacity-5 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                 <Rocket size={120} className="text-secondary" />
              </div>

              <div className="flex items-center gap-5 mb-8">
                 <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-2 group-hover:bg-secondary/10 transition-colors duration-500">
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} className="w-full h-full object-contain" alt="" />
                    ) : (
                      <Globe size={32} className="text-on-surface-variant/20" />
                    )}
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-on-surface uppercase tracking-tight">{brand.name}</h3>
                    <div className="flex gap-2 mt-1">
                       {isApproved && <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded">Active Access</span>}
                       {isPendingReq && <span className="text-[8px] font-black uppercase text-amber-400 tracking-widest bg-amber-400/10 px-2 py-0.5 rounded">Review Pending</span>}
                       {isRejected && <span className="text-[8px] font-black uppercase text-red-400 tracking-widest bg-red-400/10 px-2 py-0.5 rounded">Request Denied</span>}
                    </div>
                 </div>
              </div>

              <div className="grow mb-8 text-sm font-medium text-on-surface-variant leading-relaxed line-clamp-3 italic opacity-60">
                 {brand.description || "Premium partner platform focused on high-precision affiliate management and corporate scaling."}
              </div>

              <div className="pt-6 border-t border-white/5">
                  {(isAvailable || isRejected) ? (
                    <button 
                      onClick={() => handleApply(brand.id)}
                      disabled={isPending || kycStatus !== 'APPROVED'}
                      className={cn(
                        "w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:scale-[1.02] active:scale-[0.95] transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-40 disabled:grayscale transition-all",
                        isRejected ? "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/40" : "bg-secondary text-white shadow-secondary/10"
                      )}
                    >
                      {isPending ? <Loader2 size={16} className="animate-spin" /> : <>{isRejected ? "RE-APPLY" : "Request Access"} <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" /></>}
                    </button>
                  ) : (
                    <div className={cn(
                      "w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] text-center border transition-all",
                      isApproved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-on-surface-variant/40 border-white/5"
                    )}>
                      {isApproved ? "CONNECTION ACTIVE" : "APPLIED / IN REVIEW"}
                    </div>
                  )}
              </div>
            </GlassCard>
          );
        })}

        {filteredBrands.length === 0 && (
          <div className="col-span-1 md:col-span-3 py-32 text-center text-on-surface-variant opacity-20">
             <Sparkles size={64} className="mx-auto mb-6" />
             <p className="font-black uppercase tracking-[0.4em]">Grid Empty</p>
             <p className="text-xs uppercase mt-2 tracking-widest">No brand matches your filtration criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
