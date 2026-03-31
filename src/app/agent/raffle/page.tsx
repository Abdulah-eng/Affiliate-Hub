"use client";

import React, { useState } from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Trophy, 
  RotateCw, 
  Ticket, 
  Smartphone, 
  Wallet, 
  Coins, 
  Star, 
  Bell, 
  ChevronRight, 
  LayoutDashboard,
  ShieldCheck,
  Zap,
  TrendingUp
} from "lucide-react";
import { cn } from '@/lib/utils';

const WINNERS = [
  { name: 'User123', prize: '10,000 GCASH!', color: 'text-primary' },
  { name: 'LuckySpinner', prize: '1,000 CHIPS', color: 'text-secondary' },
  { name: 'AffiliateKing', prize: 'iPhone 15 Pro!', color: 'text-tertiary' },
  { name: 'JuanDelaCruz', prize: '200 GCASH', color: 'text-primary' },
  { name: 'RichieRich', prize: '10,000 GCASH!', color: 'text-primary' }
];

export default function RaffleArenaPage() {
  const [isSpinning, setIsSpinning] = useState(false);

  const startSpin = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 3000);
  };

  return (
    <div className="animate-vapor">
      {/* Winner Marquee */}
      <div className="mb-10 overflow-hidden bg-surface-container-low/40 backdrop-blur-xl py-4 rounded-full border border-primary/10 flex items-center px-8 shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <div className="flex items-center gap-3 mr-10 shrink-0 text-secondary z-10">
          <Star size={18} fill="currentColor" className="animate-pulse" />
          <span className="font-headline font-black text-xs uppercase tracking-[0.3em] whitespace-nowrap">Winner's Circle</span>
        </div>
        <div className="flex animate-marquee whitespace-nowrap gap-16 text-sm font-bold text-on-surface-variant z-10">
          {[...WINNERS, ...WINNERS].map((w, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-white/40">●</span>
              {w.name} won <span className={cn("font-black", w.color)}>{w.prize}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Left Column: Interactive Wheels */}
        <div className="xl:col-span-8 space-y-10">
          
          {/* Standard Spin Wheel */}
          <GlassCard className="p-10 flex flex-col items-center border-primary/20 bg-surface-container-low/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <RotateCw size={120} className="text-primary" />
            </div>
            
            <div className="text-center mb-10 relative z-10">
              <h2 className="text-3xl font-black font-headline tracking-tighter uppercase mb-2">Standard <span className="text-primary">Spin Wheel</span></h2>
              <p className="text-on-surface-variant text-sm font-medium">Utilize Spin-Tickets for instant CHIP allocations.</p>
            </div>

            <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center z-10 transition-transform duration-500 hover:scale-105">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-[80px] animate-pulse"></div>
              
              {/* Outer Ring */}
              <div className="absolute inset-[-10px] rounded-full border-[10px] border-surface-container-highest shadow-[0_0_40px_rgba(129,236,255,0.15)] ring-1 ring-primary/20"></div>
              
              {/* Spinning Element */}
              <div className={cn(
                "w-full h-full rounded-full border-4 border-primary/40 relative overflow-hidden flex items-center justify-center bg-slate-950 transition-all shadow-inner",
                isSpinning ? "animate-[spin_1s_linear_infinite]" : "duration-700"
              )}>
                {/* Segments */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  <div className="border-r border-b border-primary/20 bg-primary/5 flex items-center justify-center pt-8">
                    <span className="text-primary font-black -rotate-[45deg] text-base tracking-tighter">500</span>
                  </div>
                  <div className="border-l border-b border-primary/20 flex items-center justify-center pt-8">
                    <span className="text-on-surface-variant font-black rotate-[45deg] text-sm tracking-widest">NO WIN</span>
                  </div>
                  <div className="border-r border-t border-primary/20 flex items-center justify-center pb-8">
                    <span className="text-on-surface-variant font-black -rotate-[135deg] text-base tracking-tighter">200</span>
                  </div>
                  <div className="border-l border-t border-primary/20 bg-secondary/5 flex items-center justify-center pb-8">
                    <span className="text-secondary font-black rotate-[135deg] text-base tracking-tighter">1000</span>
                  </div>
                </div>
                
                {/* Hub */}
                <div className="absolute w-14 h-14 rounded-full bg-surface-container-high border-2 border-primary shadow-[0_0_20px_#81ecff] z-20 flex items-center justify-center">
                  <Zap size={24} className="text-primary fill-current" />
                </div>
              </div>
              
              {/* Indicator */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-10 bg-primary z-30 shadow-[0_0_15px_#81ecff]" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-4 relative z-10 w-full">
              <div className="bg-slate-950/80 border border-primary/20 px-6 py-4 rounded-2xl flex items-center gap-4">
                <Ticket className="text-primary" size={20} />
                <div className="text-left">
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Available Spikes</p>
                  <p className="text-sm font-black text-on-surface">12 Tickets</p>
                </div>
              </div>
              <button 
                onClick={startSpin}
                disabled={isSpinning}
                className="flex-1 max-w-[240px] bg-primary text-background px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:shadow-[0_0_40px_rgba(129,236,255,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSpinning ? 'SYCHRONIZING...' : 'INITIALIZE SPIN'}
              </button>
            </div>
          </GlassCard>

          {/* Grand Raffle Wheel */}
          <GlassCard className="p-10 flex flex-col items-center bg-gradient-to-br from-surface-container-high/80 to-surface-container-low border-tertiary/20 relative overflow-hidden shadow-3xl">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-tertiary/10 via-transparent to-transparent opacity-60"></div>
             
             <div className="text-center mb-10 relative z-10">
               <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-tertiary/20 text-tertiary rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4 border border-tertiary/30">
                 <ShieldCheck size={12} /> Premium Vault Access
               </span>
               <h2 className="text-4xl font-black font-headline tracking-tighter uppercase mb-2">Grand <span className="text-tertiary">Raffle Arena</span></h2>
               <p className="text-on-surface-variant text-sm font-medium italic opacity-70">High-magnitude entries for legendary physical rewards.</p>
             </div>

             <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center z-10">
               <div className="absolute inset-0 rounded-full bg-tertiary/20 blur-[100px] animate-pulse-slow"></div>
               
               {/* Spinning Outer Orbit */}
               <div className="absolute -inset-4 rounded-full border-2 border-tertiary/20 border-dashed animate-[spin_20s_linear_infinite]"></div>
               
               {/* Premium Wheel */}
               <div className="w-full h-full rounded-full border-[12px] border-slate-900 shadow-[0_0_50px_rgba(166,140,255,0.3)] relative overflow-hidden flex items-center justify-center bg-slate-950 ring-2 ring-tertiary/40">
                  <div className="absolute inset-0 opacity-20" style={{ 
                    background: 'conic-gradient(from 0deg, #a68cff, #6e9bff, #81ecff, #a68cff)'
                  }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full relative">
                      <span className="absolute top-12 left-1/2 -translate-x-1/2 font-black text-xs text-on-surface tracking-widest drop-shadow-xl uppercase">iPhone 15+</span>
                      <span className="absolute right-12 top-1/2 -translate-y-1/2 font-black text-xs text-on-surface tracking-widest drop-shadow-xl rotate-90 uppercase">10k GCash</span>
                      <span className="absolute bottom-12 left-1/2 -translate-x-1/2 font-black text-xs text-on-surface tracking-widest drop-shadow-xl rotate-180 uppercase">1k Chips</span>
                      <span className="absolute left-12 top-1/2 -translate-y-1/2 font-black text-xs text-on-surface tracking-widest drop-shadow-xl -rotate-90 uppercase">200 GCash</span>
                    </div>
                  </div>
                  
                  {/* Center Star Hub */}
                  <div className="absolute w-20 h-20 rounded-full bg-slate-950 border-4 border-tertiary shadow-[0_0_30px_#a68cff] z-30 flex items-center justify-center">
                    <Trophy size={32} className="text-tertiary fill-current animate-pulse" />
                  </div>
               </div>
               
               {/* Premium Indicator */}
               <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-14 bg-tertiary z-40 shadow-[0_0_25px_#a68cff]" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
             </div>

             <div className="mt-12 flex flex-wrap justify-center gap-6 relative z-10 w-full px-4">
                <div className="bg-slate-950/90 border border-tertiary/30 px-8 py-5 rounded-3xl flex items-center gap-5">
                  <Ticket className="text-tertiary" size={24} />
                  <div className="text-left">
                    <p className="text-[10px] font-black text-tertiary leading-none uppercase tracking-widest">Raffle Inputs</p>
                    <p className="text-lg font-black text-on-surface mt-1">3 Active</p>
                  </div>
                </div>
                <button className="flex-1 max-w-[280px] bg-gradient-to-r from-tertiary to-secondary text-white px-10 py-5 rounded-3xl text-[12px] font-black uppercase tracking-[0.3em] hover:shadow-[0_15px_40px_rgba(166,140,255,0.4)] transition-all hover:scale-[1.03] active:scale-95 shadow-xl">
                  GRAND DEPLOYMENT
                </button>
             </div>
          </GlassCard>
        </div>

        {/* Right Column: Status & Preview */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* System Intelligence */}
          <GlassCard className="p-8 rounded-3xl border-primary/10 bg-surface-container-low/60 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <Bell size={48} className="text-primary" />
            </div>
            <h3 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <RotateCw size={18} className="animate-spin-slow" />
              Node Intelligence
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Limited Anomaly', text: 'Double chips on every spin active for 2h!', time: 'Ends 11:59 PM', color: 'primary' },
                { label: 'Asset Vault', text: 'iPhone 15 Pro added to the Grand Raffle.', time: 'Min: 5 Invites', color: 'tertiary' }
              ].map((update, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all cursor-pointer">
                  <span className={cn("text-[9px] font-black uppercase tracking-widest", update.color === 'primary' ? "text-primary" : "text-tertiary")}>{update.label}</span>
                  <p className="text-sm font-bold text-on-surface mt-2">{update.text}</p>
                  <p className="text-[10px] text-on-surface-variant mt-3 opacity-60 font-black">{update.time}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Prize Manifest */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.4em] ml-2">Prize Manifest</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { name: 'iPhone 15', tier: 'Grand', icon: <Smartphone size={24} />, color: 'primary' },
                { name: '10k GCash', tier: 'Cash', icon: <Wallet size={24} />, color: 'secondary' },
                { name: '1k Chips', tier: 'Instant', icon: <Coins size={24} />, color: 'tertiary' }
              ].map((prize, idx) => (
                <GlassCard key={idx} className="p-6 flex items-center justify-between border-white/5 hover:border-primary/20 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={cn("p-4 rounded-2xl bg-white/[0.03] group-hover:scale-110 transition-transform", 
                      prize.color === 'primary' ? "text-primary" : prize.color === 'secondary' ? "text-secondary" : "text-tertiary"
                    )}>
                      {prize.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{prize.tier} Reward</p>
                      <p className="text-lg font-black text-on-surface uppercase tracking-tight">{prize.name}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-on-surface-variant group-hover:text-primary transition-all group-hover:translate-x-1" />
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Leaderboard Glimpse */}
          <GlassCard className="p-8 rounded-3xl bg-surface-container-low/40 border-white/5 overflow-hidden">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.3em]">Top Operatives</h3>
               <span className="text-[9px] font-black text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full border border-primary/20">Monthly</span>
             </div>
             <div className="space-y-4">
               {[
                 { user: 'CryptoAce', points: '850k', rank: 1, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAG1xSu6Mnyj-ESR95-QPo6I1tRgnuja8MEoNDX_zT-3YClTSGlJNFHEjJevdMxFzhOirrk1l30rECN36ax9xGN1wv1lkg7krBBoPMwfnVVjeWed9-GjcwuVA1zA8MWZ1YBHeqlBKHlEz1uOOTbgVk-nccY7g8fYtzYc8dDdJBdW5vIa9XCcr-3l2ISrdo1f1jvCEfEKAx8fi4rMb6ra3_U2rHoJRH7TqLnQyxLB36ySZSSeVwysTRktjPgp-QHAUjBh4shbDAJiQ0' },
                 { user: 'NeonQueen', points: '712k', rank: 2, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlnvdvFGokzSaBxFFv2byoM2903etZJ9U6JGGL3g1uWOtgLlgNYuHehrH_G4JhG7WyPe1oyKZt_f1Pw__W2JDGyKIEpGuEPPQFyVhbQKaxXwE8rRHz68_Q5Who1dIeyCrXupc_vsuH2iSnkuUZpqYaR-ncAzgqriIKj-X_buOjMbvNTJPmoi-0Idgv6hYH3NZw5IsBPaJd129N1OoMlXsgdxYw6HRTBEbLVxoz-ojF9m1HXzN89zyyRUK9xPHmKJOLwA_rBpC8INA' }
               ].map((u, i) => (
                 <div key={i} className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                   <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-black text-xs text-primary">{u.rank}</div>
                   <img src={u.avatar} className="w-10 h-10 rounded-full object-cover grayscale opacity-60" />
                   <div className="flex-1">
                     <p className="text-xs font-black text-on-surface uppercase tracking-tight">{u.user}</p>
                     <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{u.points} PTS</p>
                   </div>
                 </div>
               ))}
             </div>
             <button className="w-full mt-8 py-4 text-[10px] font-black text-on-surface-variant hover:text-primary transition-all uppercase tracking-[0.3em] bg-white/[0.02] rounded-2xl border border-white/5">Full Leaderboard View</button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
