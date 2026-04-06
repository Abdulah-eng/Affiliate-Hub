import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Globe, 
  Zap, 
  ShieldCheck, 
  Server, 
  Cpu, 
  Database,
  ArrowUpRight,
  MousePointer2
} from "lucide-react";

export default function NetworkPage() {
  const regions = [
    { name: "Luzon Hub", load: "78%", latency: "12ms", status: "Healthy", color: "text-emerald-400" },
    { name: "Visayas Node", load: "45%", latency: "24ms", status: "Healthy", color: "text-emerald-400" },
    { name: "Mindanao Relay", load: "62%", latency: "38ms", status: "Healthy", color: "text-emerald-400" },
    { name: "International GW", load: "92%", latency: "85ms", status: "Congested", color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto space-y-16">
        {/* Hero */}
        <div className="animate-vapor">
          <div className="flex items-center gap-3 text-primary mb-4">
            <Globe size={24} className="animate-spin-slow" />
            <span className="text-xs font-black uppercase tracking-[0.4em]">Global Infrastructure</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter uppercase leading-none">
            Kinetic <span className="text-primary">Network</span>
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mt-6 font-medium leading-relaxed">
            Highly-distributed node infrastructure for maximum conversion velocity and zero-latency expansion.
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-vapor">
          {regions.map((region, idx) => (
            <GlassCard key={idx} className="p-8 space-y-6 border-white/5 hover:border-primary/20 transition-all group">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-black font-headline uppercase tracking-tight">{region.name}</h3>
                <span className={`text-[10px] font-black uppercase tracking-widest ${region.color}`}>{region.status}</span>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                    <span>Load</span>
                    <span>{region.load}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: region.load }} />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  <span>Latency</span>
                  <span className="text-primary">{region.latency}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-vapor">
          {/* Tech Stack */}
          <GlassCard className="p-12 space-y-8 bg-surface-container-low/40 relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-10 opacity-5">
              <Cpu size={150} className="text-primary" />
            </div>
            <div className="relative z-10 space-y-2 text-center md:text-left">
              <h3 className="text-3xl font-black font-headline uppercase tracking-tight">The <span className="text-primary">Core Engine</span></h3>
              <p className="text-on-surface-variant font-medium leading-relaxed">
                Utilizing next-generation synchronization protocols and AI-pivoted load balancing.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              {[
                { name: "Prisma ORM", desc: "Type-safe database bridging.", icon: <Database size={18} /> },
                { name: "MySQL Local", desc: "High-performance data storage.", icon: <Server size={18} /> },
                { name: "Next.js 15", desc: "Dynamic server rendering.", icon: <Zap size={18} /> },
                { name: "Kinetic UI", desc: "Premium high-fidelity interface.", icon: <MousePointer2 size={18} /> },
              ].map((tech, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/20 transition-all flex flex-col gap-2">
                  <div className="text-primary">{tech.icon}</div>
                  <h4 className="text-xs font-black uppercase tracking-tight">{tech.name}</h4>
                  <p className="text-[10px] text-on-surface-variant font-medium opacity-60 leading-tight">{tech.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Map / Visualization (Mock) */}
          <GlassCard className="p-0 overflow-hidden bg-surface-container-low/40 flex items-center justify-center min-h-[400px] border-primary/10 relative group">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
             {/* Simple Abstract Map Elements */}
             <div className="relative w-full h-full flex items-center justify-center opacity-30 group-hover:opacity-50 transition-all duration-700">
                <div className="absolute w-[80%] h-[80%] rounded-full border border-primary/20 animate-spin-slow"></div>
                <div className="absolute w-[60%] h-[60%] rounded-full border border-primary/10 animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
                <Globe size={180} className="text-primary" />
             </div>
             <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-background/90 to-transparent text-center">
                <h4 className="text-xl font-headline font-black uppercase tracking-tight">Active Coverage</h4>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">12 Nodes Interlinked</p>
             </div>
          </GlassCard>
        </div>

        {/* Audit / Compliance Banner */}
        <div className="p-8 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 flex flex-col md:flex-row items-center justify-between gap-6 animate-vapor">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 flex items-center justify-center text-emerald-400 shrink-0">
               <ShieldCheck size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-on-surface font-headline uppercase tracking-tight">External Security Audit <span className="text-emerald-400">PASSED</span></h4>
              <p className="text-sm text-on-surface-variant font-medium opacity-80">Our network core has cleared the Q2 2026 kinetic security audit with zero vulnerabilities detected.</p>
            </div>
          </div>
          <button className="px-8 py-3 bg-emerald-400 text-background rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all flex items-center gap-2 whitespace-nowrap">
             Full Audit Log <ArrowUpRight size={14} />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
