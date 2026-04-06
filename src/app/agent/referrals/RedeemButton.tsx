"use client";

import React, { useState } from "react";
import { redeemRewards } from "@/app/actions/agent";
import { Loader2, CheckCircle2 } from "lucide-react";

export function RedeemButton() {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleRedeem = async () => {
    setIsRedeeming(true);
    setStatus("idle");
    const res = await redeemRewards();
    if (res.success) {
      setStatus("success");
    } else {
      setStatus("error");
    }
    setIsRedeeming(false);
    
    if (res.success) {
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="mt-12 w-full">
      <button 
        onClick={handleRedeem}
        disabled={isRedeeming || status === "success"}
        className="w-full py-5 bg-primary/10 hover:bg-primary text-primary hover:text-background border border-primary/30 font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(129,236,255,0.1)] active:scale-95 text-[11px] flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isRedeeming ? <Loader2 size={16} className="animate-spin" /> : 
         status === "success" ? <><CheckCircle2 size={16}/> Redeemed</> : 
         "Redeem Rewards"}
      </button>
      {status === "error" && (
        <p className="text-[10px] text-red-400 text-center mt-2 font-bold uppercase tracking-widest">
          Failed to verify or claim rewards.
        </p>
      )}
    </div>
  );
}
