"use client";

import React from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Settings, 
  ShieldAlert, 
  Zap, 
  Database, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock, 
  BarChart2, 
  Save, 
  RotateCcw,
  ShieldCheck,
  BrainCircuit,
  Lock,
  ChevronRight
} from "lucide-react";
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  return (
    <div className="animate-vapor">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">System Economy HUD</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
          Vault <span className="text-primary tracking-normal">Configuration</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-4">
          Manage the algorithmic core of Affiliate Hub PH gamification. Adjust point velocities, conversion weights, and moderation protocols.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <GlassCard className="p-6 flex flex-col justify-between bg-surface-container-low/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Points in Circulation</span>
            <Database size={20} className="text-primary" />
          </div>
          <div>
            <div className="text-3xl font-black text-primary tracking-tighter">12.4M</div>
            <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 mt-1 uppercase tracking-widest">
              <TrendingUp size={12} /> +14.2% This Week
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6 flex flex-col justify-between bg-surface-container-low/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Total Redeemed</span>
            <Lock size={20} className="text-tertiary" />
          </div>
          <div>
            <div className="text-3xl font-black text-tertiary tracking-tighter">₱2.8M</div>
            <div className="text-[9px] text-on-surface-variant/60 font-black mt-1 uppercase tracking-widest">Estimated Value</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col justify-between bg-surface-container-low/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Active Multiplier</span>
            <Zap size={20} className="text-secondary fill-current" />
          </div>
          <div>
            <div className="text-4xl font-black text-secondary tracking-tighter">2.0x</div>
            <div className="text-[9px] text-secondary/80 font-black mt-1 uppercase tracking-widest animate-pulse">Weekend Surge Active</div>
          </div>
        </GlassCard>

        <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-2xl border border-primary/20 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Health Monitor</span>
            <ShieldCheck size={20} className="text-primary" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[8px] font-black text-primary/60 uppercase">
              <span>Node Load: 24%</span>
              <span>API: 12ms</span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
               <div className="bg-primary h-full w-[94%]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Config Column */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Allocation Rules */}
          <GlassCard className="p-10 border-primary/5 bg-surface-container-low/20">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h3 className="text-2xl font-black text-on-surface uppercase tracking-tight font-headline">Allocation Rules</h3>
                <p className="text-sm text-on-surface-variant font-medium mt-1">Set point velocity for user activities.</p>
              </div>
              <button className="text-[9px] font-black text-primary px-5 py-2 border border-primary/20 rounded-full hover:bg-primary/10 transition-all uppercase tracking-widest">
                Revert Defaults
              </button>
            </div>

            <div className="space-y-6">
              {[
                { label: 'New Referral', desc: 'Points per successful node propagates', val: 500, icon: <Users size={20} />, color: 'primary' },
                { label: 'Chat Engagement', desc: 'Points per high-quality message node', val: 10, icon: <MessageSquare size={20} />, color: 'secondary' },
                { label: 'Daily Session', desc: 'Reward for daily vault synchronization', val: 50, icon: <Clock size={20} />, color: 'tertiary' }
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-surface-container-high/40 border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110",
                      item.color === 'primary' ? "bg-primary/10 text-primary border-primary/20" : 
                      item.color === 'secondary' ? "bg-secondary/10 text-secondary border-secondary/20" : 
                      "bg-tertiary/10 text-tertiary border-tertiary/20"
                    )}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-black text-on-surface text-base uppercase tracking-tight">{item.label}</p>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-60">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <input type="number" defaultValue={item.val} className="w-24 bg-slate-900 border-white/10 rounded-xl px-4 py-3 text-sm font-black text-primary text-center focus:ring-primary focus:border-primary" />
                     <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">PTS</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-12 py-5 bg-primary text-background font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(129,236,255,0.3)] hover:shadow-[0_0_50px_rgba(129,236,255,0.5)] transition-all active:scale-95 text-[11px] flex items-center justify-center gap-3">
              <Save size={18} /> Deploy Allocation Rules
            </button>
          </GlassCard>

          {/* Conversion Gates */}
          <GlassCard className="p-10 border-white/5 bg-surface-container-low/20">
            <h3 className="text-2xl font-black text-on-surface uppercase tracking-tight font-headline mb-10">Conversion Gates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-slate-950 border border-white/5 relative group">
                <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp size={40} className="text-primary" /></div>
                <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] block mb-6">GCash Liquidity Node</label>
                <div className="flex items-center justify-between bg-surface-container-high/50 p-6 rounded-2xl border border-primary/20">
                  <div className="text-center">
                    <p className="text-2xl font-black text-primary font-headline tracking-tighter">1,000</p>
                    <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest">PTS</p>
                  </div>
                  <ChevronRight className="text-on-surface-variant/40" />
                  <div className="text-center">
                    <p className="text-2xl font-black text-emerald-400 font-headline tracking-tighter">₱100.00</p>
                    <p className="text-[8px] font-black text-emerald-400/60 uppercase tracking-widest">PHP CASH</p>
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-3xl bg-slate-950 border border-white/5 relative group">
                 <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldCheck size={40} className="text-secondary" /></div>
                 <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] block mb-6">Input Matrix Cost</label>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                       <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Spin Logic</span>
                       <span className="text-sm font-black text-secondary tracking-widest">200 PTS</span>
                    </div>
                    <div className="flex justify-between items-center px-2">
                       <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Raffle Entry</span>
                       <span className="text-sm font-black text-secondary tracking-widest">500 PTS</span>
                    </div>
                 </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Side Column: Security & Campaigns */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* AI Moderation */}
          <GlassCard className="p-10 border-red-500/20 bg-red-500/[0.01] shadow-2xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-lg font-black text-on-surface uppercase tracking-tight">Sentinel V2</h3>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-sm font-black text-on-surface uppercase tracking-tight">AI Moderation</p>
                  <p className="text-xs text-on-surface-variant font-medium">Automatic Fraud Detection</p>
                </div>
                <div className="w-12 h-6 bg-red-500 rounded-full flex items-center px-1 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Input Sensitivity</span>
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">High Magnitude</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5">
                   <div className="bg-red-500 h-full w-[85%] rounded-full shadow-[0_0_10px_#ef4444]" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
                 <p className="text-[9px] font-black text-red-400 uppercase tracking-[0.2em] mb-2">Spam Penalty Allocation</p>
                 <div className="flex justify-between items-center">
                    <p className="text-xs font-medium text-on-surface-variant italic">Deduction per violation</p>
                    <p className="text-sm font-black text-red-500 tracking-widest">-250 PTS</p>
                 </div>
              </div>
            </div>
          </GlassCard>

          {/* Campaign Multipliers */}
          <GlassCard className="p-10 border-secondary/20 bg-secondary/[0.01] relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBfmcsdTQ7erzpWOmUmJ1iMWrS2KZvblVufcjjUmL8yqAFpnIo9o3RjEBcifv-tAkrrpIU8eXVZP4kHQBV_wVYDCRF9KAe6D0fVjydCvtyPueTifmFCy2-VDP2IQXaqosuWLBm6unuoJmrqGkRkkgzgOh0KW5Z-BSqQbaYqBJOfzYfysdkEtsmQD7rPs2aBkyBR25EmOrPhXbm_v4KL7LX1w7DhOx6NQHZRQaqn3kJoRlDP8MReBAvLbgHrx0j7VxljuLVs6Mu4TWA')] bg-cover" />
            <div className="relative z-10">
              <h3 className="text-lg font-black text-on-surface uppercase tracking-tight mb-8 flex items-center gap-3">
                <Zap className="text-secondary fill-current" size={20} />
                Campaigns
              </h3>
              
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-surface-container-high/60 border border-secondary/20 relative shadow-2xl">
                   <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-secondary text-background text-[8px] font-black rounded-full uppercase tracking-tighter">Live Node</span>
                      <span className="text-[9px] font-mono text-secondary animate-pulse uppercase tracking-widest">ends in 14h : 22m</span>
                   </div>
                   <p className="text-lg font-black text-on-surface uppercase tracking-tight">Weekend Surge 2x</p>
                   <p className="text-[10px] text-on-surface-variant font-medium mt-1 leading-relaxed">Global 2x multiplier for all node propagation events.</p>
                </div>

                <button className="w-full py-4 border-2 border-dashed border-outline-variant/20 rounded-2xl text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 group">
                  <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Schedule New Campaign
                </button>
              </div>
            </div>
          </GlassCard>

          {/* System Health */}
          <div className="p-8 rounded-3xl bg-slate-950 border border-white/5 flex flex-col gap-6">
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Vault Service Status: Optimal</span>
             </div>
             <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#a3aac4]">
                <div className="flex flex-col gap-1">
                   <span>DB Clusters</span>
                   <span className="text-primary">Healthy</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                   <span>Ingress Load</span>
                   <span className="text-primary">Nominal</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
