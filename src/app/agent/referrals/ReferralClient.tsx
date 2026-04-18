"use client";

import React, { useState } from "react";
import { Copy, CheckCircle2, Share2 } from "lucide-react";

export function ReferralClient({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = `${baseUrl}/apply?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Agent Invite Link</label>
        <div className="flex gap-3">
          <div className="flex-1 bg-surface-container-high border border-outline-variant/20 rounded-2xl px-6 flex items-center overflow-hidden h-14">
            <span className="text-on-surface-variant text-xs font-bold truncate">{referralLink}</span>
          </div>
          <button 
            onClick={handleCopy}
            className="h-14 w-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant/20 hover:bg-primary hover:text-background transition-all active:scale-95"
          >
            {copied ? <CheckCircle2 size={20} /> : <Share2 size={20} />}
          </button>
        </div>
      </div>

      <div className="bg-surface-container-high border border-outline-variant/30 px-8 py-4 rounded-2xl flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-5">
          <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">Agent Code</span>
          <span className="font-mono text-2xl font-black text-on-surface tracking-widest">{referralCode}</span>
        </div>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="p-2 text-on-surface-variant hover:text-primary transition-colors"
        >
          <Copy size={18} />
        </button>
      </div>

      {copied && (
        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2 justify-center animate-vapor">
          <CheckCircle2 size={12} /> Frequency Copied to Clipboard
        </p>
      )}
    </div>
  );
}
