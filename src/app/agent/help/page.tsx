"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  HelpCircle, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  LifeBuoy,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AgentHelpPage() {
  const categories = [
    { name: "Expansion Nodes", icon: <Zap size={18} />, color: "text-primary" },
    { name: "Vault Logic", icon: <ShieldCheck size={18} />, color: "text-emerald-400" },
    { name: "Reward Syncs", icon: <FileText size={18} />, color: "text-secondary" },
    { name: "Platform API", icon: <HelpCircle size={18} />, color: "text-tertiary" },
  ];

  return (
    <div className="animate-vapor space-y-10">
      <div>
        <h2 className="text-3xl font-black font-headline text-on-surface tracking-tight uppercase">
          Nexus <span className="text-primary">Support</span>
        </h2>
        <p className="text-on-surface-variant mt-2 font-medium">
          Authorized agent knowledge access. Synchronize with our support nodes for priority assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Help Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {categories.map((cat, i) => (
              <GlassCard key={i} className="p-6 flex items-center justify-between hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl bg-white/5", cat.color)}>
                    {cat.icon}
                  </div>
                  <h4 className="text-sm font-black text-on-surface tracking-tight uppercase">{cat.name}</h4>
                </div>
                <ChevronRight size={16} className="text-on-surface-variant group-hover:text-primary transition-all" />
              </GlassCard>
            ))}
          </div>

          {/* Direct CSR Sync Card */}
          <GlassCard className="p-10 bg-primary/10 border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
               <LifeBuoy size={120} className="text-primary" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-on-surface font-headline uppercase tracking-tight">Direct <span className="text-primary">CSR Sync</span></h3>
                 <p className="text-sm text-on-surface-variant max-w-md font-medium leading-relaxed">
                   Synchronize directly with a professional support node for instantaneous assistance with your vault or propagation issues.
                 </p>
              </div>
              <div className="flex flex-wrap gap-4">
                 <a href="mailto:support@affiliatehub.com" className="px-8 py-3.5 bg-primary text-background rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] transition-all flex items-center gap-2">
                    Initialize Chat <MessageSquare size={16} />
                 </a>
                 <a href="https://t.me/pinoaffiliate" target="_blank" rel="noreferrer" className="px-8 py-3.5 border border-primary/30 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-all flex items-center gap-2">
                    Telegram Relay <ExternalLink size={16} />
                 </a>
              </div>
            </div>
          </GlassCard>

          {/* Knowledge Glimpse */}
          <div className="space-y-6">
             <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] ml-2">Recent Propagation History</h3>
             <div className="space-y-4">
                {[
                  "How to scale your first 10 nodes.",
                  "Maximizing Raffle Arena probability.",
                  "Biometric KYC verification troubleshooting.",
                  "API key vaulting for BIGWIN credentials."
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <FileText size={18} className="text-on-surface-variant" />
                       <span className="text-sm font-medium text-on-surface-variant/80 group-hover:text-on-surface transition-colors">{doc}</span>
                    </div>
                    <ChevronRight size={14} className="text-on-surface-variant/40" />
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Status / Sidebar */}
        <div className="space-y-8 h-fit">
           <GlassCard className="p-8 space-y-6 border-white/5">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Support Node Status</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface-variant">Live Operatives</span>
                    <span className="text-xs font-black text-emerald-400">05 ACTIVE</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface-variant">Queue Wait Time</span>
                    <span className="text-xs font-black text-primary">&lt; 3 MIN</span>
                 </div>
                 <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Global Hub Healthy</span>
                 </div>
              </div>
           </GlassCard>

           <GlassCard className="p-8 space-y-6 bg-secondary/5 border-secondary/10">
              <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Agent Notice</h4>
              <p className="text-[10px] text-secondary font-black leading-relaxed uppercase tracking-widest text-center opacity-80 italic">
                Support nodes are available 24/7 for Diamond and Elite tiers. Standard nodes have priority queueing from 09:00 - 18:00 PHT.
              </p>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
