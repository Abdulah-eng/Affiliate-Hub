"use client";

import React, { useState } from "react";
import { ShieldCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface KycDisclaimerProps {
  className?: string;
}

export function KycDisclaimer({ className }: KycDisclaimerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <ShieldCheck className="text-primary" size={24} />
        <div>
          <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">
            KYC Disclaimer
          </h4>
          <p className="text-[10px] text-on-surface-variant font-medium">
            Affiliate Hub PH
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border-white/5">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10">
          <Info size={120} />
        </div>
        
        <div className={cn(
          "relative space-y-4 text-sm leading-relaxed text-on-surface-variant transition-all duration-300",
          !isExpanded && "line-clamp-3 overflow-hidden"
        )}>
          <p>
            By submitting your information through this Know Your Customer (KYC) form, you agree to the following terms:
          </p>
          <ul className="list-disc list-outside pl-5 space-y-3">
            <li>
              All personal information provided is true, accurate, and complete to the best of your knowledge.
            </li>
            <li>
              You authorize **Affiliate Hub PH** to collect, verify, and securely store your submitted data for identity verification and account approval purposes.
            </li>
            <li>
              Your information will be treated with strict confidentiality and will not be shared with unauthorized third parties, except when required by law or for verification processes.
            </li>
            <li>
              Any false, misleading, or incomplete information may result in rejection, suspension, or termination of your account.
            </li>
            <li>
              **Affiliate Hub PH** reserves the right to request additional documents or verification steps if necessary.
            </li>
            <li>
              By proceeding, you confirm that you voluntarily submit your data and understand how it will be used.
            </li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative z-10 mt-2 text-primary font-bold text-xs uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
          <ShieldCheck size={20} />
        </div>
        <p className="text-xs font-medium text-on-surface-variant">
          <span className="text-secondary font-bold">Privacy Note:</span> Your data is protected using industry-standard security measures. We are committed to safeguarding your personal information at all times.
        </p>
      </div>
    </div>
  );
}
