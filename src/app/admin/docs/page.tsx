import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  FileText, 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  Database, 
  Terminal,
  ChevronRight,
  Info
} from "lucide-react";

export default function AdminDocsPage() {
  const SECTIONS = [
    { 
      title: "Kinetic Protocol V2", 
      desc: "Standard operating procedures for point velocity and system economy multipliers.",
      icon: <Zap className="text-primary" size={24} />,
      items: ["Multiplier Logic", "Surge Campaigns", "Redemption Weights"]
    },
    { 
      title: "KYC Standards", 
      desc: "Criteria for manual operative review and identity verification protocols.",
      icon: <ShieldCheck className="text-secondary" size={24} />,
      items: ["Document Clarity", "Selfie Matching", "Fraud Red Flags"]
    },
    { 
      title: "Terminal Commands", 
      desc: "Direct system interactions for level 1 administrators and CSR nodes.",
      icon: <Terminal className="text-tertiary" size={24} />,
      items: ["Balance Overrides", "Node Suspensions", "Sync Refresh"]
    }
  ];

  return (
    <div className="animate-vapor">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="text-primary" size={20} />
          <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em] font-headline">Internal Knowledge Base</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
          System <span className="text-primary tracking-normal">Documentation</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-4">
          The central repository for Affiliate Hub PH operational standards and technical protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {SECTIONS.map((section, idx) => (
          <GlassCard key={idx} className="p-8 border-white/5 bg-surface-container-low/20 group hover:border-primary/20 transition-all">
            <div className="mb-6 w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
              {section.icon}
            </div>
            <h3 className="text-xl font-black text-on-surface uppercase tracking-tight mb-3">
              {section.title}
            </h3>
            <p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-8">
              {section.desc}
            </p>
            <ul className="space-y-3">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
                  <ChevronRight size={14} className="text-primary" /> {item}
                </li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-10 border-primary/10 bg-primary/[0.01]">
        <div className="flex flex-col md:flex-row gap-10 items-center">
           <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
                    <Info size={24} />
                 </div>
                 <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight">Need technical assistance?</h2>
              </div>
              <p className="text-on-surface-variant leading-relaxed font-medium">
                If the documentation does not resolve your structural query, please initiate a direct transmission with the Executive Support Node.
              </p>
              <button className="px-8 py-4 bg-primary text-background font-black uppercase tracking-widest text-[10px] rounded-full hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] transition-all">
                Contact Technical Node
              </button>
           </div>
           <div className="w-full md:w-64 h-64 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuCHmXfJscU8CByK3tqYyM9eYOn-f5hIEx3Kz1G_W5e6J6wVn6z1n6wVn6z1n6wVn6z1n6wVn6z1')] bg-cover rounded-3xl opacity-20 border border-white/10" />
        </div>
      </GlassCard>
    </div>
  );
}
