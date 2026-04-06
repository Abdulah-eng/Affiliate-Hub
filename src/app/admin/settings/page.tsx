"use client";

import React, { useEffect, useState, useTransition } from 'react';
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
  ChevronRight,
  Loader2
} from "lucide-react";
import { cn } from '@/lib/utils';
import { getSystemSettings, updateSystemSettings } from '@/app/actions/admin';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const data = await getSystemSettings();
    const settingsMap = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    setSettings(settingsMap);
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleDeploy = () => {
    startTransition(async () => {
      const res = await updateSystemSettings(settings);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    });
  };

  const updateVal = (key: string, val: string) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

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
              <button 
                onClick={fetchSettings}
                className="text-[9px] font-black text-primary px-5 py-2 border border-primary/20 rounded-full hover:bg-primary/10 transition-all uppercase tracking-widest"
              >
                Revert Defaults
              </button>
            </div>

            <div className="space-y-6">
              {[
                { key: 'POINTS_REFERRAL', label: 'New Referral', desc: 'Points per successful node propagates', icon: <Users size={20} />, color: 'primary' },
                { key: 'POINTS_CHAT', label: 'Chat Engagement', desc: 'Points per high-quality message node', icon: <MessageSquare size={20} />, color: 'secondary' },
                { key: 'POINTS_DAILY', label: 'Daily Session', desc: 'Reward for daily vault synchronization', icon: <Clock size={20} />, color: 'tertiary' }
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
                     <input 
                       type="number" 
                       value={settings[item.key] || "0"} 
                       onChange={(e) => updateVal(item.key, e.target.value)}
                       className="w-24 bg-slate-900 border-white/10 rounded-xl px-4 py-3 text-sm font-black text-primary text-center focus:ring-primary focus:border-primary outline-none" 
                     />
                     <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">PTS</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleDeploy}
              disabled={isPending}
              className={cn(
                "w-full mt-12 py-5 font-black uppercase tracking-[0.3em] rounded-2xl transition-all active:scale-95 text-[11px] flex items-center justify-center gap-3",
                saveSuccess 
                  ? "bg-emerald-500 text-background shadow-[0_0_30px_rgba(16,185,129,0.3)]" 
                  : "bg-primary text-background shadow-[0_0_30px_rgba(129,236,255,0.3)] hover:shadow-[0_0_50px_rgba(129,236,255,0.5)]"
              )}
            >
              {isPending ? <Loader2 className="animate-spin" size={18} /> : saveSuccess ? <ShieldCheck size={18} /> : <Save size={18} />}
              {saveSuccess ? "Configuration Deployed" : "Deploy Allocation Rules"}
            </button>
          </GlassCard>
        </div>

        {/* Side Column: Security & Campaigns */}
        <div className="lg:col-span-4 space-y-10">
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
            </div>
          </GlassCard>
          
          <div className="p-8 rounded-3xl bg-slate-950 border border-white/5 flex flex-col gap-6">
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Vault Service Status: Optimal</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
