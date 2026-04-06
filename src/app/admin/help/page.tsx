import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  HelpCircle, 
  Search, 
  Send, 
  ShieldCheck, 
  MessageSquare, 
  Activity, 
  BarChart2, 
  Globe
} from "lucide-react";

export default function AdminHelpPage() {
  const CATEGORIES = [
    { title: "System Status", count: 14, icon: <Activity className="text-emerald-400" size={24} /> },
    { title: "Network Diagnostics", count: 8, icon: <Globe className="text-primary" size={24} /> },
    { title: "User Resolutions", count: 22, icon: <MessageSquare className="text-secondary" size={24} /> },
    { title: "Security Alerts", count: 3, icon: <ShieldCheck className="text-red-400" size={24} /> },
  ];

  return (
    <div className="animate-vapor">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="text-primary" size={20} />
          <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em] font-headline">Executive Support Node</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
          Admin <span className="text-primary tracking-normal">Support</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-4">
          Manage your administrative queries and system diagnostics in real-time.
        </p>
      </div>

      <div className="relative mb-16 max-w-3xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={24} />
        <input 
          placeholder="Search for resolution nodes or system protocols..." 
          className="w-full bg-surface-container-low/40 border border-white/5 h-16 rounded-3xl pl-16 pr-8 text-lg font-medium outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all shadow-2xl"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {CATEGORIES.map((cat, idx) => (
          <GlassCard key={idx} className="p-8 border-white/5 bg-surface-container-low/20 group hover:border-primary/20 transition-all cursor-pointer">
            <div className="mb-6 w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
              {cat.icon}
            </div>
            <h3 className="text-lg font-black text-on-surface uppercase tracking-tight mb-2">
              {cat.title}
            </h3>
            <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest">
              {cat.count} Knowledge Nodes
            </p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12">
          <GlassCard className="p-10 border-primary/10 bg-primary/[0.01] relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center text-center md:text-left">
                <div className="flex-1 space-y-6">
                   <h2 className="text-3xl font-black text-on-surface uppercase tracking-tight">Need direct human intervention?</h2>
                   <p className="text-on-surface-variant leading-relaxed text-lg font-medium">
                     A level 3 technical specialist is currently active. Transmissions are processed with priority within 10 minutes.
                   </p>
                   <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                     <button className="px-10 py-5 bg-primary text-background font-black uppercase tracking-widest text-xs rounded-full hover:shadow-[0_0_30px_rgba(129,236,255,0.4)] transition-all flex items-center gap-3">
                       <Send size={20} /> Open Direct Stream
                     </button>
                     <button className="px-10 py-5 bg-surface-container-high text-on-surface font-black uppercase tracking-widest text-xs rounded-full hover:bg-surface-bright transition-all flex items-center gap-3">
                       <BarChart2 size={20} /> View Diagnostics
                     </button>
                   </div>
                </div>
                <div className="w-64 h-64 bg-primary/10 rounded-full blur-[100px] absolute -right-20 -bottom-20" />
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
