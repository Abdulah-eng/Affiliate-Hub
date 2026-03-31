"use client";

import React from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  BarChart3, 
  Check, 
  Hourglass, 
  Rocket, 
  Copy, 
  Eye, 
  ExternalLink, 
  Lock, 
  Plus, 
  Lightbulb, 
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Activity,
  Search
} from "lucide-react";
import { cn } from '@/lib/utils';

export default function AgentDashboard() {
  const PLATFORMS = [
    { 
      id: 'BW', 
      name: 'BIGWIN', 
      url: 'bigwin-partner.ph/login', 
      user: 'zenith_bw_01', 
      status: 'Ready', 
      color: 'primary' 
    },
    { 
      id: 'WF', 
      name: 'WinForLife', 
      url: 'wfl-agent.com/secure', 
      user: 'Pending approval', 
      status: 'Under Review', 
      color: 'secondary', 
      locked: true 
    },
    { 
      id: 'RL', 
      name: 'Rollem', 
      url: 'rollem-partners.ph', 
      user: 'az_roll_99', 
      status: 'Ready', 
      color: 'tertiary' 
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-vapor">
      {/* Left Column: Main Controls */}
      <div className="lg:col-span-8 space-y-10">
        
        {/* Active Application Status */}
        <section className="glass-card rounded-2xl p-8 border-l-[6px] border-secondary shadow-[0_0_40px_rgba(110,155,255,0.05)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Activity size={120} className="text-secondary" />
          </div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary ring-1 ring-secondary/20">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-headline font-black text-on-surface uppercase tracking-tight">Application Status: <span className="text-secondary">WinForLife</span></h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black mt-1">Status Identifier: CSR_REV_001</p>
              </div>
            </div>
            <button className="px-6 py-2.5 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-black uppercase tracking-widest transition-all">
              Timeline Details
            </button>
          </div>

          <div className="relative flex justify-between items-center px-6 mb-4">
            {/* Progress Line */}
            <div className="absolute top-5 left-10 right-10 h-1 bg-surface-container-highest z-0">
              <div className="h-full bg-gradient-to-r from-primary to-secondary w-[66%] shadow-[0_0_10px_rgba(0,229,255,0.2)]"></div>
            </div>
            
            {[
              { label: 'Account', status: 'done', icon: <Check size={16} /> },
              { label: 'KYC', status: 'done', icon: <Check size={16} /> },
              { label: 'CSR Review', status: 'active', icon: <Hourglass size={16} className="animate-pulse" /> },
              { label: 'Activated', status: 'pending', icon: <Rocket size={16} /> }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                <div className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500",
                  step.status === 'done' ? "bg-primary text-background shadow-[0_0_15px_rgba(129,236,255,0.4)]" :
                  step.status === 'active' ? "bg-secondary text-white ring-4 ring-background shadow-[0_0_20px_rgba(110,155,255,0.4)] scale-110" :
                  "bg-surface-container-highest flex border border-outline-variant text-on-surface-variant opacity-50"
                )}>
                  {step.icon}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  step.status === 'pending' ? "text-on-surface-variant opacity-50" : "text-on-surface"
                )}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Platform Vault */}
        <section className="space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Lock size={20} />
              </div>
              <h2 className="text-2xl font-headline font-black text-on-surface uppercase tracking-tight">Platform Vault</h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-3 rounded-xl hover:bg-white/5 text-on-surface-variant transition-colors group">
                <Search size={20} className="group-hover:scale-110 transition-transform" />
              </button>
              <button className="px-6 py-3 rounded-full bg-primary text-background font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(129,236,255,0.2)] hover:scale-105 active:scale-95 transition-all">
                Sync Credentials
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {PLATFORMS.map((platform) => (
              <GlassCard 
                key={platform.id} 
                className={cn(
                  "p-6 hover:bg-surface-container/40 transition-all cursor-default border-l-4",
                  platform.color === 'primary' ? "border-primary" : platform.color === 'secondary' ? "border-secondary grayscale opacity-80" : "border-tertiary"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-5 min-w-[200px]">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner border border-white/5",
                      platform.color === 'primary' ? "text-primary bg-primary/10" : platform.color === 'secondary' ? "text-secondary bg-secondary/10" : "text-tertiary bg-tertiary/10"
                    )}>
                      {platform.id}
                    </div>
                    <div>
                      <h4 className="font-headline font-black text-on-surface text-lg uppercase tracking-tight">{platform.name}</h4>
                      <div className={cn(
                        "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mt-1 border",
                        platform.status === 'Ready' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}>
                        {platform.status}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-[0.2em] ml-1">Access URL</p>
                      <p className={cn("text-xs font-bold truncate", platform.color === 'primary' ? "text-primary" : "text-on-surface/60")}>{platform.url}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-[0.2em] ml-1">Identifier</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold">{platform.user}</span>
                        {!platform.locked && <Copy size={12} className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors" />}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-[0.2em] ml-1">Security Key</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono tracking-[0.4em] opacity-50">••••••••</span>
                        {!platform.locked ? (
                          <>
                            <Eye size={12} className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors" />
                            <Copy size={12} className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors" />
                          </>
                        ) : (
                          <Lock size={12} className="text-on-surface-variant opacity-50" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    <button className={cn(
                      "px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all duration-300",
                      platform.locked 
                        ? "bg-white/5 text-on-surface-variant/40 cursor-not-allowed" 
                        : "bg-primary/5 hover:bg-primary text-primary hover:text-background border border-primary/20"
                    )}>
                      {platform.locked ? 'LOCKED' : 'LAUNCH'}
                      {platform.locked ? <Lock size={14} /> : <ExternalLink size={14} />}
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}

            <div className="rounded-3xl border-2 border-dashed border-outline-variant/30 flex items-center justify-center p-10 hover:border-primary/50 transition-all cursor-pointer group bg-white/[0.01] hover:bg-primary/5">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-background transition-all duration-500 ring-4 ring-transparent group-hover:ring-primary/20">
                  <Plus size={24} />
                </div>
                <div>
                  <p className="font-headline font-black text-on-surface uppercase tracking-tight text-lg">Apply for New Platform</p>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-[0.2em] mt-1">Scale your agent reach across the network</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: Intel & Updates */}
      <div className="lg:col-span-4 space-y-10">
        {/* Hub Updates */}
        <GlassCard className="p-8 rounded-3xl border-t-[6px] border-tertiary bg-surface-container-low/40">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-sm font-headline font-black text-on-surface uppercase tracking-[0.3em]">Hub Updates</h3>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary shadow-[0_0_10px_#a68cff]"></span>
            </span>
          </div>

          <div className="space-y-8">
            {[
              { tag: 'NEW CAMPAIGN', time: '2h ago', title: 'Rollem: Double Rebate Weekend', desc: 'Earn 2x points for all new player registrations this Saturday...', color: 'text-tertiary' },
              { tag: 'SYSTEM', time: '5h ago', title: 'KYC System Upgrade v2.4', desc: 'Automated verification is now live for elite diamond tier agents...', color: 'text-primary' },
              { tag: 'NOTIFICATION', time: '1d ago', title: 'Settlement Verified', desc: 'Your weekly commission withdrawal has been successfully processed...', color: 'text-on-surface-variant' }
            ].map((news, idx) => (
              <div key={idx} className="group cursor-pointer animate-vapor" style={{ animationDelay: `${idx * 0.15}s` }}>
                <p className={cn("text-[9px] font-black mb-2 uppercase tracking-[0.2em]", news.color)}>{news.tag} • <span className="opacity-60">{news.time}</span></p>
                <h5 className="text-sm font-black text-on-surface group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">{news.title}</h5>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed font-medium line-clamp-2">{news.desc}</p>
                {idx !== 2 && <div className="h-[1px] bg-white/5 mt-8"></div>}
              </div>
            ))}
          </div>
          
          <button className="w-full mt-10 py-4 border border-outline-variant hover:border-tertiary rounded-2xl text-[10px] font-black text-on-surface-variant hover:text-tertiary transition-all uppercase tracking-[0.2em]">
            View Comprehensive Archive
          </button>
        </GlassCard>

        {/* Access Intel */}
        <GlassCard className="p-8 rounded-3xl bg-gradient-to-br from-surface-container/20 to-surface-container-high/40 border-primary/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-xl text-primary border border-primary/20">
              <Lightbulb size={20} />
            </div>
            <h3 className="text-sm font-headline font-black text-on-surface uppercase tracking-[0.2em]">Access Intel</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-5">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-surface-container flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors">
                <Lock size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-on-surface uppercase tracking-tight">Encrypted Terminal</p>
                <p className="text-[10px] text-on-surface-variant mt-1.5 font-bold leading-relaxed">Chrome Incognito or Brave Browser is mandated for secure session handling.</p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-surface-container flex items-center justify-center text-secondary/40 group-hover:text-secondary transition-colors">
                <Activity size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-on-surface uppercase tracking-tight">Latency Check</p>
                <p className="text-[10px] text-on-surface-variant mt-1.5 font-bold leading-relaxed">Ensure pop-ups and redirects are authorized for *.vault.ph domains.</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Agent Support */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none transition-all duration-700 group-hover:to-primary/10"></div>
          <img 
            alt="Support Hub" 
            className="w-full h-32 object-cover rounded-2xl mb-6 opacity-60 group-hover:opacity-100 transition-all duration-700 brightness-[0.4] group-hover:brightness-[0.6]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPOpY8YsZmvxWJ8D3L9HDyFQlW1sEhqga7MV5Bzw7kXi-AMqLpZPuygfUjdS3kR5lNoLONx0Lvhiuyrikr_I0oJvZ4OFl_pc4U_ySqmL0jXZgi2hlDAbU_J6vNXgeIHMAXGI6Z8Ssxp19w6DDo5wgShzXggWBIVZpSxt2_BUghLNu0d4peKeGows9PAHVAPU57Cw5FeUmyYbHqKWmucBoP2oFW9OjfC_zRCLEmwV4auekvzCFpbaMruVdJKUw4GTIlF8D3aIrukfw" 
          />
          <h4 className="text-base font-black text-on-surface uppercase tracking-tight">Agent Support Hub</h4>
          <p className="text-[10px] text-on-surface-variant mt-2 mb-8 font-bold leading-relaxed">Secure onboarding or settlement assistance via dedicated managers. Available 24/7/365.</p>
          <button className="w-full py-4 bg-surface-container-high/50 hover:bg-primary text-on-surface-variant hover:text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-white/5 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            OPEN SUPPORT VAULT
          </button>
        </div>
      </div>

      {/* Quick Action FAB */}
      <button className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-primary text-background shadow-[0_10px_40px_rgba(129,236,255,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[70] group">
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>
    </div>
  );
}
