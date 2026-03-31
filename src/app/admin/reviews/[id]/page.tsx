"use client";

import React, { use } from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  ShieldCheck, 
  Flag, 
  CheckCircle2, 
  MapPin, 
  Mail, 
  Calendar, 
  TrendingUp, 
  FileSearch, 
  Download, 
  Maximize2,
  ChevronLeft,
  Stars,
  Send,
  XCircle,
  PauseCircle,
  StickyNote
} from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="animate-vapor">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <Link href="/admin/reviews" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-4 text-xs font-bold uppercase tracking-widest">
            <ChevronLeft size={16} /> Back to Queue
          </Link>
          <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface">
            Application <span className="text-primary">Review</span>
          </h1>
          <p className="text-on-surface-variant mt-2 font-medium">Processing Request <span className="text-primary font-mono bg-primary/5 px-2 py-0.5 rounded">{id}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-4 bg-surface-container-high border border-outline-variant/30 text-on-surface-variant rounded-full hover:border-red-500/50 hover:text-red-400 transition-all active:scale-95 font-bold uppercase tracking-widest text-xs group">
            <Flag size={16} className="group-hover:fill-red-400 transition-all" />
            Flag for Review
          </button>
          <button className="flex items-center gap-2 px-8 py-4 bg-primary text-background rounded-full hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] transition-all active:scale-95 font-bold uppercase tracking-widest text-xs">
            <CheckCircle2 size={16} />
            Approve KYC
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile & Documents */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Main Identity Card */}
          <GlassCard className="p-8 bg-surface-container-low/40">
            <div className="flex items-center gap-5 mb-8">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-secondary p-[1px] shadow-[0_0_20px_rgba(129,236,255,0.1)]">
                <div className="h-full w-full rounded-[14px] bg-slate-950 overflow-hidden">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbG0yWhgzHXyY2Xh69TZvxk7DtxSTvcDb0eWaCrfPoenCG59polTQvrbD4ySrasYI9Br9BjScdNysVx7da3aTHWcBa03zPEzS2DCqxIcwK7AA-lI_4yo1vwHJz8ksXYj4Cg8jV0-iRKL_Cn4eqtQX_wPt5RU4BHPbIe_B1aO6NiAt4PYlVXEOMKCcGx7z69wz2tcIbwu1p0cIPFVv5J0_U4rnKpjL2_9gj_tUdmIBpuVAk3fUcOKcj4PsCVNirQUaDhTWT98qF4Q4" 
                    alt="Applicant" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-on-surface font-headline tracking-tighter">Mateo Dela Cruz</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Live Session</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-2xl bg-surface-container-high/50 border border-outline-variant/10">
                  <p className="text-[9px] uppercase font-black text-on-surface-variant tracking-[0.2em] mb-2">National ID Node</p>
                  <p className="text-sm font-bold text-on-surface font-mono">PH-2023-889-1-VAULT</p>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-high/50 border border-outline-variant/10">
                  <p className="text-[9px] uppercase font-black text-on-surface-variant tracking-[0.2em] mb-2">Email Identity</p>
                  <p className="text-sm font-bold text-on-surface">m.delacruz@kinetic.ph</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-high/50 border border-outline-variant/10">
                <p className="text-[9px] uppercase font-black text-on-surface-variant tracking-[0.2em] mb-2">Residential Node</p>
                <p className="text-sm font-medium text-on-surface leading-relaxed">Unit 402, Highrise Tower A, BGC, Taguig City, Metro Manila</p>
              </div>
            </div>
          </GlassCard>

          {/* Document Preview */}
          <GlassCard className="p-0 overflow-hidden bg-surface-container-low/40">
            <div className="px-8 py-5 border-b border-primary/10 bg-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Identity Evidence</h4>
            </div>
            <div className="p-6 space-y-4">
              <div className="group relative rounded-2xl overflow-hidden aspect-[16/10] bg-surface-container-low border border-outline-variant/30">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf_wHj20mX4-eKIH-QX2qsBRgB4lJk1QoUhIRn-9wIfRgZyZpU1sGGpzxR7dpcVJUEsi-ZZGk6QQr4DGYht93D1b2TdWa-IiPKKaQAaOF5AwrE4R1j6YV1o5hhlD5zdQHLjYfEjCiQKXko8XM-mhQXcbmHQUq7i1f2fr6bW2wV09KF6bfQM1tE4NviKvaSaJy0K28WwT2ROvSKZtzlt-Qyvq4Q2wjlP1BejfE2-stx9aQiisRTPbWoQVmveeYdevRXUHkmmKymUpY" 
                  className="object-cover w-full h-full grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 brightness-75 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-sm">
                  <button className="p-3 bg-primary rounded-full text-background shadow-[0_0_15px_rgba(129,236,255,0.4)]"><Maximize2 size={20} /></button>
                  <button className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"><Download size={20} /></button>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-on-surface border border-white/10">PH National ID (FRONT)</div>
              </div>
              <div className="group relative rounded-2xl overflow-hidden aspect-[16/10] bg-surface-container-low border border-outline-variant/30">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAh8YyvKo_aC-LrSCPmZFgErCuiHLhE7-maIceZoTysamnsUQQXrM7VdyD6EeGZ2oWgUaxZIJcz0RLVsQeKLAvon78GfjH21-7hyVkoV-b_jqeqvT7ERSZa46NZvnc9gJ0A6UH1w-rMP-4EVq7DL5CRMzr-pTmXXGokrHIB1iNoqnR_NfJSOapbQuO9HJDdOFxwEJJ03stVIDEW72txq16oG25VmEzx_ez4XKBEfUn3eyA_17aYnJeTXd-V_tYmatQn6p1pz2d4zvw" 
                  className="object-cover w-full h-full grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 brightness-75 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-sm">
                  <button className="p-3 bg-primary rounded-full text-background shadow-[0_0_15px_rgba(129,236,255,0.4)]"><Maximize2 size={20} /></button>
                  <button className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"><Download size={20} /></button>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-on-surface border border-white/10">Biometric Liveness Check</div>
              </div>
            </div>
          </GlassCard>

          {/* AI Metrics Card */}
          <div className="p-8 bg-surface-container-low rounded-2xl border-l-[6px] border-secondary flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <div>
              <h5 className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] mb-2">Confidence Rating</h5>
              <p className="text-4xl font-black text-on-surface font-headline tracking-tighter">94.2<span className="text-xl font-normal text-secondary ml-1">%</span></p>
            </div>
            <div className="h-16 w-16 rounded-full border-[6px] border-secondary/10 border-t-secondary animate-spin-slow flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center animate-none">
                <ShieldCheck size={32} className="text-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Controls */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-black text-on-surface font-headline uppercase tracking-tight">Access Provisioning</h3>
            <div className="flex items-center gap-3 bg-surface-container-high px-5 py-2 rounded-full border border-outline-variant/30">
              <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse shadow-[0_0_10px_#6e9bff]"></span>
              <span className="text-[10px] font-black text-on-surface uppercase tracking-[0.2em]">02 Active Nodes</span>
            </div>
          </div>

          <div className="space-y-8">
            {/* Platform: WinForLife */}
            <GlassCard className="p-0 overflow-hidden border-primary/20 bg-surface-container-low/20">
              <div className="p-8 border-b border-outline-variant/10 flex flex-wrap items-center justify-between gap-6 bg-white/[0.02]">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                    <Stars size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-on-surface uppercase tracking-tight font-headline">WinForLife</h4>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mt-1">Premium Platform • High Traffic</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2">Gate Status</p>
                    <span className="px-4 py-1.5 rounded-full bg-surface-container-high text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">Awaiting Provision</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="h-12 w-12 rounded-2xl flex items-center justify-center bg-surface-container-high text-primary hover:bg-primary hover:text-background transition-all border border-primary/10"><CheckCircle2 size={20} /></button>
                    <button className="h-12 w-12 rounded-2xl flex items-center justify-center bg-surface-container-high text-red-400 hover:bg-red-500 hover:text-background transition-all border border-red-500/10"><XCircle size={20} /></button>
                    <button className="h-12 w-12 rounded-2xl flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:bg-on-surface hover:text-background transition-all border border-white/10"><PauseCircle size={20} /></button>
                  </div>
                </div>
              </div>
              <div className="p-10 bg-black/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Assigned Identifier</label>
                    <input className="w-full bg-surface-container-high border-outline-variant/30 rounded-2xl focus:ring-primary focus:border-primary text-sm font-bold text-primary h-14 px-6 transition-all" value="af_mateo_902"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Vault Security Key</label>
                    <input className="w-full bg-surface-container-high border-outline-variant/30 rounded-2xl focus:ring-primary focus:border-primary text-sm font-bold text-on-surface h-14 px-6 transition-all" type="password" value="KINETIC_SECRET_X"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Dedicated Gateway</label>
                    <input className="w-full bg-surface-container-high border-outline-variant/30 rounded-2xl focus:ring-primary focus:border-primary text-sm font-bold text-on-surface h-14 px-6 transition-all" value="https://wfl.ph/gate/af-902"/>
                  </div>
                </div>
                <div className="flex justify-end gap-6">
                  <button className="px-8 py-3 rounded-2xl text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/10 transition-all">Save Node Config</button>
                  <button className="px-10 py-4 rounded-2xl bg-primary text-background font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_0_20px_rgba(129,236,255,0.2)] flex items-center gap-3">
                    <Send size={16} /> Deploy to Dashboard
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* Internal Notes */}
            <GlassCard className="p-10 bg-surface-container-low/30 border-secondary/10">
              <div className="flex items-center gap-4 mb-8">
                <StickyNote className="text-secondary" size={24} />
                <h4 className="text-sm font-black uppercase tracking-[0.3em] text-on-surface">Operative Intel & Notes</h4>
              </div>
              <textarea 
                className="w-full bg-surface-container-high/40 border border-outline-variant/20 rounded-2xl focus:ring-secondary focus:border-secondary text-sm text-on-surface-variant min-h-[160px] p-6 font-medium leading-relaxed outline-none transition-all placeholder:text-on-surface-variant/40" 
                placeholder="Initialize notes regarding this operative's risk profile or platform requirements..."
              />
              <div className="mt-8 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden hover:translate-y-[-4px] transition-transform cursor-pointer">
                      <img 
                        src={i === 1 ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCNCVuNvPhBmO4YjH1WuSEqKbgcgKen-ASHUgX-T0ioqSBfzIfdB-zkKqagMbLuZwVhbDPfDv8V3iFaaCDkF4auuazYPV7lGpcS9DYE2f_Wjijrz-OFD5nEQkjVRyK60lI1fSIe5XljfP91nQLFdAqxIPHSU4ZKs_ggQIaZfJYDk8xvpH_gvf6RxxXD66pFNp6-kFTXjlLZ5or2f8dIggkrgzENt9uAKhW_8MS4IpLMpKqFQAg1b2Aeguz90rXQCmBAk5gaBi72jkk" : "https://lh3.googleusercontent.com/aida-public/AB6AXuBhcqGMU6eezofhbZqrq2eiuQiUqmzGQOIqQGzWl6b3ty0MFfx8vkIKcDyyykF3pw2s2_1S9kprVWE8Umjbgmg7_ZTidbqn9hy-d7NemErSccqX215WP4iJbCL7w4AKRCX0SkrSAYXiMI30LhI7JHNympMOdJ6LfCDlAudD5OpWIMAGTDU6gZkBDQVR1VPM67ylrtnTrUlWKZajDFPbvwtJvE0CZiXEHMQrX8sl_EJMHN8JC1bHVechWOa4-STaQH631gleR9Gr0IQ"} 
                        alt="Admin" 
                      />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-surface-container border-2 border-background flex items-center justify-center text-on-surface-variant text-[10px] font-black">+2</div>
                </div>
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest bg-white/[0.02] px-4 py-2 rounded-full border border-white/5">Vault Access: Senior Controller</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
