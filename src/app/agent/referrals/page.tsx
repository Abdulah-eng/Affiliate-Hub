"use client";

import React from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Wallet, 
  Share2, 
  Copy, 
  Trophy, 
  Users, 
  TrendingUp, 
  Gift, 
  Target, 
  Zap, 
  ArrowUpRight,
  ShieldCheck,
  Stars
} from "lucide-react";
import { cn } from '@/lib/utils';

const ACTIVITY = [
  { user: 'Juan Dela Cruz', handle: 'JD', event: 'New Signup', status: 'Verified', points: '+500', color: 'primary' },
  { user: 'Maria Santos', handle: 'MS', event: 'Wallet Sync', status: 'Pending', points: '+200', color: 'tertiary' },
  { user: 'Rico Blanco', handle: 'RB', event: 'Referral Verified', status: 'Verified', points: '+1,200', color: 'primary' },
  { user: 'Anne Garcia', handle: 'AG', event: 'Chat Milestone', status: 'Verified', points: '+50', color: 'primary' }
];

const LEADERBOARD = [
  { rank: '#1', handle: '@CryptoPioneer', invites: '1,240', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtbKRatpfljNMW_p06Ysp4KQUNszzwTjIwgmOK2dgPc_vNRE20sBoL12nOt7woB2tEhgSLghXR1nBGQBqJPLf6ouaeT9MvWK3DEa72v5rNytXmcHy79tcPuPxcRd5CXiU_NjCa34PRQigjBY7VOvEC6cC1wlLjL03R_uqgzUl4RC3yAMgmGb0BUkqFz05aLFn-E9IWF7PcUNr2OgA-n25bsj0v2523YT1Rnm5U2gwRclH5Jzcgf2q-xxlFyk-eRhr08Nopfhi4pd0' },
  { rank: '#2', handle: '@MarketingMaverick', invites: '985', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9bn_WVGtK0J2NVI_O5A40pKks_iejjZUlMF9cjWEuObrPUol8HQsykgA9jqj0KfHW1JclK1OKeC01l7367hxvjnIKFpwUGW15GTLOZDleTkMTJaNqvPohd1UCQnsaioIFCz1wu2NCpZCjllWR05AD6T0smoBwXIFmWEsDXtbBY_xSkS1nxCC3KQCXM1FWRrVfEelD6iOhLXaz3CmitMeKQoOS_Ix8WNd5XIkbpzp2CLrHOBq8uq7QCE2fm3fBpkg3F94Re1eWarM' },
  { rank: '#3', handle: '@PixelPinoy', invites: '870', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB-Cx-6Zuor4ub67YJL3_p_Un31CNMBtRBI5JCE1NMmdEI1kOGdZXOkx63q6CXl8QKOGEIyvHcWzihFDtUX5vapHCjjbYUkgtbupMy4H35h-_f6lFdpYtGyTK9Bm2FUMoYJDkPJB0I5v4G6F94YcuDxjFLBFLhHFOmXMyOJ9HYLWja0hV6o4VrjNFSkuNwhbYCkH6RtjYq-rYBv_IH9skFfQNt4ucOyDrsVnzx5hMwoaK4EMuUEXCMcnyHMIqQkAMUbe8wMgMvtWA' }
];

export default function ReferralCenterPage() {
  return (
    <div className="animate-vapor">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-6xl font-black text-on-surface font-headline tracking-tighter mb-4 uppercase">
          Command <span className="text-primary">Center</span>
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl font-medium leading-relaxed">
          Scale your affiliate network with precision. Track performance, manage referrals, and unlock elite kinetic rewards.
        </p>
      </div>

      {/* Top Grid: Wallet & Code */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Points Wallet */}
        <GlassCard className="lg:col-span-1 p-8 flex flex-col justify-between relative overflow-hidden group border-primary/20 bg-surface-container-low/40">
          <div className="absolute -top-10 -right-10 size-40 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Wallet size={20} />
              </div>
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-on-surface-variant">Kinetic Balance</span>
            </div>
            
            <div className="flex items-baseline gap-3 mb-10">
              <span className="text-6xl font-black text-on-surface tracking-tighter font-headline">24,580</span>
              <span className="text-primary font-black tracking-widest text-sm uppercase">PTS</span>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Referral Earning</span>
                  <span className="text-sm font-black text-on-surface">18,200 pts</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary shadow-[0_0_10px_rgba(129,236,255,0.4)]" style={{ width: '74%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Chat Activity</span>
                  <span className="text-sm font-black text-on-surface">6,380 pts</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary shadow-[0_0_10px_rgba(166,140,255,0.4)]" style={{ width: '26%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <button className="mt-12 w-full py-5 bg-primary text-background font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(129,236,255,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 text-[11px]">
            <Gift size={20} /> Redeem Points
          </button>
        </GlassCard>

        {/* Engine & Referral Code */}
        <GlassCard className="lg:col-span-2 p-10 flex flex-col justify-between border-primary/5 bg-surface-container-low/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-on-surface font-headline uppercase tracking-tight">Referral Engine</h3>
              <p className="text-sm text-on-surface-variant font-medium">Distribute your unique identifier to scale your syndicate.</p>
            </div>
            <div className="bg-surface-container-high border border-outline-variant/30 px-8 py-4 rounded-2xl flex items-center gap-5 shadow-inner">
              <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">Node Code</span>
              <span className="font-mono text-2xl font-black text-on-surface tracking-widest">PH-HUB-2024</span>
              <Copy size={18} className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Propagation Link</label>
              <div className="flex gap-3">
                <div className="flex-1 bg-surface-container-high border border-outline-variant/20 rounded-2xl px-6 flex items-center overflow-hidden h-14">
                  <span className="text-on-surface-variant text-xs font-bold truncate">affiliatehub.ph/ref/zenith_99</span>
                </div>
                <button className="h-14 w-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant/20 hover:bg-primary hover:text-background transition-all active:scale-95">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end px-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Monthly Quota Tracker</label>
                <span className="text-xs font-black text-on-surface">18 / 25 <span className="text-on-surface-variant">NODES</span></span>
              </div>
              <div className="w-full h-4 bg-surface-container-high rounded-full overflow-hidden flex p-1">
                <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_15px_rgba(129,236,255,0.4)]" style={{ width: '72%' }}></div>
              </div>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                <Target size={12} /> 7 More Nodes to Elite status
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t border-white/5">
            {[
              { label: 'Total Nodes', val: '142', icon: <Users size={16} />, color: 'primary' },
              { label: 'Propagation Rate', val: '12.4%', icon: <TrendingUp size={16} />, color: 'primary' },
              { label: 'Conversion', val: '8.2%', icon: <Zap size={16} />, color: 'secondary' }
            ].map((stat, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-surface-container-high/40 border border-outline-variant/10 flex flex-col gap-2">
                <div className={cn("text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2", stat.color === 'primary' ? "text-primary" : "text-secondary")}>
                  {stat.icon} {stat.label}
                </div>
                <p className="text-3xl font-black text-on-surface font-headline tracking-tighter">{stat.val}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Activity & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Real-time Activity */}
        <GlassCard className="lg:col-span-8 flex flex-col bg-surface-container-low/20 p-0 overflow-hidden border-white/5 shadow-2xl">
          <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-headline text-2xl font-black text-on-surface uppercase tracking-tight flex items-center gap-4">
              <Zap className="text-primary" size={24} />
              Propagation Stream
            </h3>
            <button className="text-primary text-[10px] font-black uppercase tracking-[0.3em] hover:underline underline-offset-8">Terminal View</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-surface-container-high/40">
                <tr>
                  <th className="px-10 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Operative</th>
                  <th className="px-10 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Node Event</th>
                  <th className="px-10 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Status</th>
                  <th className="px-10 py-5 text-right pr-10 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Point Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ACTIVITY.map((row, idx) => (
                  <tr key={idx} className="group hover:bg-white/[0.03] transition-all duration-500">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-black text-xs border border-white/10",
                          row.color === 'primary' ? "text-primary border-primary/20" : "text-tertiary border-tertiary/20"
                        )}>
                          {row.handle}
                        </div>
                        <span className="font-black text-on-surface text-sm tracking-tight">{row.user}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{row.event}</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        row.status === 'Verified' ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 text-on-surface-variant/50 border-white/10"
                      )}>{row.status}</span>
                    </td>
                    <td className={cn("px-10 py-6 text-right font-black text-sm tracking-widest", row.color === 'primary' ? "text-primary" : "text-on-surface-variant")}>
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 flex justify-center bg-white/[0.01]">
            <button className="text-on-surface-variant/40 hover:text-primary transition-all font-black text-[9px] uppercase tracking-[0.3em] flex items-center gap-3 group">
              Initialize More History <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </GlassCard>

        {/* Leaderboard Card */}
        <GlassCard className="lg:col-span-4 rounded-3xl p-0 flex flex-col bg-surface-container-low/40 border-primary/5">
          <div className="p-10 border-b border-white/5">
            <h3 className="font-headline text-2xl font-black text-on-surface uppercase tracking-tight mb-8">Leaderboard</h3>
            <div className="flex gap-2 p-1.5 bg-surface-container-low/50 rounded-2xl border border-white/5 shadow-inner">
              <button className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary text-background shadow-lg transition-all">Inviters</button>
              <button className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl text-on-surface-variant hover:text-on-surface transition-all">Chatters</button>
            </div>
          </div>
          
          <div className="p-6 space-y-5">
            {LEADERBOARD.map((item, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-center gap-4 p-5 rounded-3xl border transition-all duration-500 overflow-hidden relative group cursor-pointer",
                  idx === 0 ? "bg-primary/5 border-primary/20 scale-[1.05] z-10 shadow-[0_0_30px_rgba(129,236,255,0.1)]" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-primary/10"
                )}
              >
                {idx === 0 && (
                  <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                    <Trophy size={64} className="text-primary" />
                  </div>
                )}
                <span className={cn("text-xl font-black italic tracking-tighter w-8", idx === 0 ? "text-primary" : "text-on-surface-variant/40")}>{item.rank}</span>
                <div className={cn(
                  "w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all p-[2px]",
                  idx === 0 ? "border-primary shadow-[0_0_15px_rgba(129,236,255,0.3)]" : "border-outline-variant/30 grayscale hover:grayscale-0"
                )}>
                  <img src={item.avatar} alt="User" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-on-surface text-sm uppercase tracking-tight">{item.handle}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">{item.invites} Nodes Propagation</p>
                </div>
              </div>
            ))}

            {/* Current User Rank Block */}
            <div className="mt-10 pt-10 border-t border-white/5">
              <div className="p-5 rounded-3xl bg-surface-container-high border-2 border-primary/20 shadow-[0_0_30px_rgba(129,236,255,0.05)] flex items-center gap-5 relative">
                <div className="absolute -right-1 -top-1 bg-primary text-background text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">ELITE NODE</div>
                <span className="text-xl font-black text-on-surface italic tracking-tighter">#42</span>
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary/40 p-[2px]">
                   <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg1BIoJavd3TB4Y6AvC2Ko8vCQbgZT7SPOnwucgfjXLfg3j_3NHL26zrOv27B3ES68-l_JWrdpZjAmjJcSUz2wsGks6pN-cXRDCZ5ohjDVKFrj6Bx8FrB-CglknTNmcVdiIuKOYHULTfvEfu-a4hGhj-2iXI-9GhxbOAETKadRjHuAgKp28SzvQc3JazYpmjHwc2y1eWK_tXyWHuNXuyJaKNnpgW3CgL0tqfKY6tnN7m8oCDCgbZB7MG420rAQEsWX_bhmRBRRusA" alt="Self" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-on-surface text-sm uppercase tracking-tight">You (Zenith)</p>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">128 Nodes Propagated</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="text-[10px] font-black text-primary">LVL4</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
