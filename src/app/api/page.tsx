import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Terminal, 
  Code2, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Clipboard,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ApiDocsPage() {
  const endpoints = [
    { method: "GET", path: "/api/chat/sync", desc: "Retrieve the latest frequency transmissions from the Nexus Feed." },
    { method: "POST", path: "/api/chat/send", desc: "Broadcast a new message to the global operative network." },
    { method: "GET", path: "/api/agent/stats", desc: "Fetch real-time kinetic stats for the current vault session." },
    { method: "POST", path: "/api/kyc/submit", desc: "Initialize a new operative identification packet." }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="animate-vapor">
          <div className="flex items-center gap-4 text-primary mb-6">
            <Code2 size={40} className="animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter uppercase">
               Kinetic <span className="text-primary">API</span>
            </h1>
          </div>
          <p className="text-on-surface-variant font-medium leading-relaxed max-w-3xl">
            Protocol documentation for integrating external nodes with the Affiliate Hub PH Kinetic Core. Version 1.2.0 (Stable).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-vapor">
          {/* Main Docs */}
          <div className="lg:col-span-8 space-y-10">
            {/* Auth Section */}
            <GlassCard className="p-10 space-y-6 bg-surface-container-low/40 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Terminal size={120} className="text-primary" />
               </div>
               <h3 className="text-2xl font-black text-on-surface font-headline uppercase tracking-tight flex items-center gap-3">
                  <ShieldCheck size={24} className="text-emerald-400" />
                  Authorization Protocol
               </h3>
               <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                  All requests must be signed with a valid JWT (JSON Web Token) from the <span className="text-primary">/api/auth</span> node. Use the Bearer token scheme in the Authorization header.
               </p>
               <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 font-mono text-xs text-on-surface-variant/80 group-hover:border-primary/20 transition-all">
                  <code className="block">Authorization: Bearer <span className="text-primary">PH_VAULT_EYJ...</span></code>
               </div>
            </GlassCard>

            {/* Endpoints */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-on-surface font-headline uppercase tracking-tight ml-2">Core Endpoints</h3>
              <div className="space-y-4">
                {endpoints.map((ep, idx) => (
                  <GlassCard key={idx} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/5 transition-all group">
                    <div className="flex items-center gap-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                        ep.method === "GET" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : "bg-primary/10 text-primary border-primary/20"
                      )}>{ep.method}</span>
                      <div>
                        <code className="text-sm font-bold text-on-surface font-mono tracking-tight group-hover:text-primary transition-colors">{ep.path}</code>
                        <p className="text-[10px] text-on-surface-variant font-medium mt-1 uppercase tracking-widest">{ep.desc}</p>
                      </div>
                    </div>
                    <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-on-surface-variant transition-all hover:text-primary">
                       <Clipboard size={16} />
                    </button>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar / Quick Reference */}
          <div className="lg:col-span-4 space-y-8">
            <GlassCard className="p-10 space-y-6 bg-primary/5 border-primary/20">
               <div className="flex items-center gap-3">
                  <Zap className="text-primary" size={20} />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Kinetic Velocity</h4>
               </div>
               <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                  Our core engine process requests with sub-100ms latency across the Luzon/Visayas nodes.
               </p>
               <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Rate Limit Status</p>
                    <div className="flex justify-between items-center text-[10px] font-black">
                       <span className="text-emerald-400">100 / 100 REQ/MIN</span>
                       <span className="text-on-surface-variant/40">Tier: Elite</span>
                    </div>
                  </div>
               </div>
            </GlassCard>

            <div className="space-y-6 h-fit sticky top-32">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-2">SDK Propagation</h4>
               <div className="space-y-3">
                  {["Javascript / Node.js", "Python Core", "Go Fusion"].map((sdk, idx) => (
                    <GlassCard key={idx} className="p-5 flex items-center justify-between border-white/5 hover:border-primary/10 transition-all group">
                       <span className="text-xs font-black text-on-surface uppercase tracking-tight">{sdk}</span>
                       <div className="flex items-center gap-2 text-[8px] font-black text-primary opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">
                          GET SDK <ArrowRight size={10} />
                       </div>
                    </GlassCard>
                  ))}
               </div>
               <p className="p-4 text-[9px] text-on-surface-variant/40 leading-relaxed uppercase tracking-widest font-black text-center">
                  All transmissions are recorded in the <span className="text-primary">Audit Log</span> for platform transparency.
               </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
