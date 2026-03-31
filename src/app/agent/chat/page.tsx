"use client";

import React, { useState } from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Send, 
  Smile, 
  Paperclip, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  Zap, 
  Users, 
  Trophy, 
  Lock, 
  TrendingUp,
  Image as ImageIcon,
  CheckCheck
} from "lucide-react";
import { cn } from '@/lib/utils';

const MESSAGES = [
  { id: 1, user: 'Alex "Conversion" King', time: '14:20 PM', text: 'Just hit my weekly target! The new affiliate banners for the Makati event are performing 20% better than the old ones. 🚀', role: 'PRO', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAK-JhtdypHSzXULEkcGn6tGnCtwOma7zJNL1_WIiRkhfX0oGMTOUjpoG4swFcN02xfqggL5f1lo9G6pcyMhVLSpIw0Hz-hIm3H-dgc1HZPVKFS4ihj5tj574O_axhv0U-DyOTnn0VR1UEv2VNpsP62nKTv7s7M496RLUjM01xHAUk3tf5WqCSCChljvaQzJjWFr7GRSGAYyYPk96_BuV8oCKZFDgZHVdEFAxAR8QlO2lqEUbwMlhDmJr-5ejw3w9q4zyv5XMHwYc', self: false, points: '+10 PTS' },
  { id: 2, user: 'You', time: '14:22 PM', text: "That's huge, Alex! Are you using the static ones or the animated HTML5 set? I noticed a difference on mobile traffic.", role: 'ELITE', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKKU1HFilghZg9DFulWfuGLhyclI3JKfIvkrUs-dbPMZqkbyvqcuUxU2ewYZ5g_NlCU4rVrKc49O7h4LDkROhx4Xp1wRPa6CPS0UP2AZHDUQMfo6TFLP_P-4uKPPvVpmndfEkg1cxhcCzG6YpBxplqSSZzIsiVLOVYrvjozqwzOmL2Sq0AYaz1GyUQesPGI5WMPvbEsHIuOt0f1JQCRnTKUexEBe9mIeJVVuWkpmBTUXvrAO_Sfn8c5-F2Hmpsbp9IK-uDoL0RRQg', self: true },
  { id: 3, user: 'Mia_Tech_PH', time: '14:25 PM', text: "Anyone experiencing delay in pixel tracking for the Lazada campaign? Need help checking if it's just my local dashboard. 🛠️", role: 'JUNIOR', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAKAp2tNHKcVcIR_v2_1sfH_Y4MSue4KSi0theQMsdGzxZ4b37Uh20WlMQl5OsApO6Tt4tE3_N4Tf1xLXUskUX9CYuUO4lhiKlleB3PT1ye9Sx7XzTEGd6BjqKXwh-Fbrtk-UjWbFKhkFEdD9RRH6sXMvMVObBuxJc1LmDNB3xIi9flluPGWtOzjmqmd62w9hXaCp_M6gVKMQ3oCWt7Yz7kR5T6GjOAwzZoqgqyOUfYQtbQZkfxDHL9zKpHMuC_oxvrIxR1cym60Y', self: false, points: '+5 PTS' }
];

export default function AgentChatPage() {
  const [input, setInput] = useState('');

  return (
    <div className="flex h-[calc(100vh-120px)] animate-vapor -mt-2">
      {/* Sidebar - Contacts & Groups */}
      <div className="w-80 hidden lg:flex flex-col border-r border-white/5 pr-8 space-y-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2">Nexus Lobby</h3>
          <div className="space-y-2">
            {[
              { name: 'Global Chat', icon: <Users size={18} />, active: true, count: '1.2k' },
              { name: 'Private Nodes', icon: <Lock size={18} />, count: '0' },
              { name: 'Squad Groups', icon: <ShieldCheck size={18} />, count: '2' }
            ].map((item, idx) => (
              <button 
                key={idx} 
                className={cn(
                  "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group",
                  item.active ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                )}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm font-black uppercase tracking-tight">{item.name}</span>
                </div>
                <span className="text-[10px] font-black opacity-40">{item.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-2 no-scrollbar">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2">Active Operatives</h3>
          <div className="space-y-3">
            {[
              { name: 'Cyber_Merchant', status: 'Healthy', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAJaedaZxQGKFUbQ15ojWyFLlvDh9k6MoJX9pKvPvlTCiD2-zojy2y-6XXhJoWxCFVagPjhvtU23OBw15cdFWmYuefMjt4rjB7QbOy6sm3Ayr8n05gKTucKiNOMEpa_XrGyPywfBrluxa4XhUWfOLEpI7czBbl56Yhv4MAR5M3z_HCYm3eSMi37VlhG8PieaqSiOisv795jxxr_C7hoJM2Z64wMCIS-cs6o1RvCQRosof_-kPSznrEnDm4zcddtvgKQ0wgTgFlMtg' },
              { name: 'Sarah_Ops', status: 'Away (5m)', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFltzfseh5LDgzXTcRAl3x2p6eqU8p6eRMtlvJBGUAGOOBWIhg-6r51H95jSTiaU0HbX5iZ8VByEw7WuBt_t27jyupyS3lBIclbCoXArlU_79ELFdGpXWZ8wfZ4hjvncKKJcsArxuSjDlHOg3BVukIJrDIs2xrDPCXKH_aN6KkJL2wrvSzumuQ8YgIv6FTFhULFW_CLFcTTBlp2j2ZJOeo1lCkjvuQJ_DQuxCNO_wJTfjQyZoNa30tpg8hyKvlkvTRAnFpQ1w3c0M' },
              { name: 'PinoAffiliate_CEO', status: 'Healthy', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAws8tUHvvAwKjGyjJcZvGJvB_DK652mlEAqC4Y8TW1Bpdr6N8BLiP-Vr_Y6byAojPUto4-0GcVGlLpGGWpL4WrQfFCvKq6dXI36XGBallEB9DNsiRBeIT9zBmWPrULMW7TKBKD-MrjvFQk90pBDy6r_aMnYQbtNL5O-TQJoVdgMT-Upew4RdwnKJoO4fzlpzxSo8SVEQQPwYq-yYeDIBHsiSeRhpcH4aQp7LCK1Hqt05xDkTvlHbzKgJnJCNUwWwCmD8bycgtKNXQ' }
            ].map((u, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/[0.03] transition-all cursor-pointer group border border-transparent hover:border-white/5">
                <div className="relative">
                  <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                  <div className={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950", u.status.includes('Away') ? "bg-amber-500" : "bg-emerald-500 animate-pulse")} />
                </div>
                <div>
                  <p className="text-xs font-black text-on-surface uppercase tracking-tight">{u.name}</p>
                  <p className="text-[9px] text-on-surface-variant font-medium uppercase">{u.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Feed */}
      <div className="flex-1 flex flex-col bg-surface-container-low/20 rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
        {/* Chat Header */}
        <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(129,236,255,0.1)]">
              <Zap fill="currentColor" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black font-headline text-on-surface uppercase tracking-tight">Nexus Feed</h2>
              <p className="text-xs text-on-surface-variant font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Real-time synchronization active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex -space-x-4">
                {[1, 2, 3].map(i => (
                  <img key={i} className="w-8 h-8 rounded-full border-2 border-surface-container-low hover:z-10 transition-all cursor-pointer" src={`https://i.pravatar.cc/150?u=${i + 10}`} />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-surface-container-high flex items-center justify-center text-[10px] font-black">+1.2k</div>
             </div>
             <button className="p-3 text-on-surface-variant hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 no-scrollbar">
          {MESSAGES.map((msg) => (
            <div key={msg.id} className={cn(
              "flex gap-5 max-w-[80%]",
              msg.self ? "flex-row-reverse ml-auto" : "flex-row"
            )}>
              <div className="shrink-0 relative h-fit">
                <img src={msg.avatar} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/5" />
                <div className={cn(
                  "absolute -bottom-1 px-1.5 rounded-sm text-[8px] font-black uppercase tracking-tighter",
                  msg.role === 'PRO' ? "bg-tertiary right-0" : 
                  msg.role === 'ELITE' ? "bg-primary p-0 text-background left-0" : 
                  "bg-on-surface-variant right-0"
                )}>
                  {msg.role}
                </div>
              </div>
              <div className={cn("space-y-2", msg.self ? "text-right" : "text-left")}>
                <div className={cn("flex items-center gap-3", msg.self ? "justify-end" : "justify-start")}>
                  {!msg.self && <span className="text-sm font-black text-on-surface uppercase tracking-tight">{msg.user}</span>}
                  <span className="text-[10px] font-black text-on-surface-variant opacity-40">{msg.time}</span>
                  {msg.self && <span className="text-sm font-black text-primary uppercase tracking-tight">You</span>}
                </div>
                <div className={cn(
                  "p-5 rounded-2xl relative group border",
                  msg.self ? "bg-primary/10 border-primary/20 rounded-tr-none text-on-surface" : "bg-white/[0.03] border-white/5 rounded-tl-none text-on-surface-variant/90"
                )}>
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                  {msg.points && (
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                       <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-2 py-1 rounded-full border border-emerald-500/30 shadow-lg">{msg.points}</span>
                    </div>
                  )}
                  {msg.self && <div className="flex justify-end mt-2"><CheckCheck size={14} className="text-primary opacity-60" /></div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-8 bg-white/[0.01] border-t border-white/5">
          <div className="bg-surface-container-high/40 border border-white/10 p-3 rounded-3xl flex items-center gap-3 focus-within:border-primary/40 transition-all shadow-xl group">
             <button className="p-3 text-on-surface-variant hover:text-primary transition-colors hover:bg-white/5 rounded-2xl"><Paperclip size={20} /></button>
             <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/30" 
              placeholder="Sync a message to the Nexus..." 
             />
             <div className="flex items-center gap-2 pr-2">
                <button className="p-3 text-on-surface-variant hover:text-primary transition-colors hover:bg-white/5 rounded-2xl hidden md:block"><Smile size={20} /></button>
                <button className="p-3 text-on-surface-variant hover:text-primary transition-colors hover:bg-white/5 rounded-2xl hidden md:block"><ImageIcon size={20} /></button>
                <button className="bg-primary text-background px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:shadow-[0_0_30px_rgba(129,236,255,0.4)] transition-all active:scale-95 group-hover:scale-[1.02]">
                   Send <Send size={16} />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Performance Hub */}
      <div className="w-96 hidden xl:flex flex-col border-l border-white/5 pl-8 space-y-10">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2">Node Performance</h3>
          <GlassCard className="p-8 bg-surface-container-low/40 border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-700">
               <Trophy size={64} className="text-primary" />
            </div>
            <div className="flex justify-between items-end mb-8 relative z-10">
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Nexus Reputation</p>
                <h4 className="text-4xl font-black text-on-surface font-headline tracking-tighter">12,450 <span className="text-sm font-black text-primary">PTS</span></h4>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Rank</p>
                <span className="text-sm font-black text-on-surface italic">#42 GLOBAL</span>
              </div>
            </div>
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center text-[9px] font-black tracking-widest text-[#a3aac4]">
                 <span>GOAL: OVERLORD</span>
                 <span>85% SYNCED</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 shadow-inner">
                 <div className="bg-gradient-to-r from-primary to-secondary h-full w-[85%] rounded-full shadow-[0_0_15px_rgba(129,236,255,0.3)]" />
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2">Daily Flux Quests</h3>
          <div className="space-y-3">
             {[
               { name: 'Nexus Sync', pts: '+50', status: 'COMPLETE', active: true },
               { name: 'Propagation I', pts: '+20', status: 'PENDING', active: false },
               { name: 'Elite Feedback', pts: '2/5', status: 'ACTIVE', active: false }
             ].map((q, i) => (
                <div key={i} className={cn(
                  "p-5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer",
                  q.active ? "bg-primary/5 border-primary/20" : "bg-white/[0.02] border-white/5 hover:border-primary/10"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                      q.active ? "bg-primary/10 text-primary" : "bg-white/5 text-on-surface-variant"
                    )}>
                      <Zap size={18} fill={q.active ? "currentColor" : "none"} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-on-surface uppercase tracking-tight">{q.name}</p>
                      <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">{q.pts} PTS Allocation</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest",
                    q.status === 'COMPLETE' ? "text-emerald-400" : 
                    q.status === 'ACTIVE' ? "text-primary" : "text-on-surface-variant"
                  )}>{q.status}</span>
                </div>
             ))}
          </div>
        </div>

        <div className="mt-auto p-8 rounded-3xl bg-slate-950 border border-white/5">
           <p className="text-[9px] font-black text-[#a3aac4] leading-relaxed uppercase tracking-widest">
              <span className="text-primary">FAIR PLAY NOTICE:</span> ENGAGEMENT REWARDS ARE AI-MONITORED. VIOLATIONS LEAD TO PERMANENT VAULT SUSPENSION.
           </p>
        </div>
      </div>
    </div>
  );
}
