import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  TrendingUp, 
  Globe, 
  Zap, 
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  MousePointer2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLiveInsights } from "@/app/actions/analytics";

export default async function InsightsPage() {
  const insights = await getLiveInsights();
  const data = insights.success && insights.data ? insights.data : { totalVolume: 0, activeNodes: 0, linkedPlatforms: 0 };

  const stats = [
    { label: "Total Network Volume", value: `${data.totalVolume.toLocaleString()} PTS`, growth: "+12.4%", icon: <TrendingUp size={20} /> },
    { label: "Active Agent Nodes", value: data.activeNodes.toLocaleString(), growth: "+5.8%", icon: <Globe size={20} /> },
    { label: "Active Provisioning", value: data.linkedPlatforms.toLocaleString(), growth: "+2.1%", icon: <Zap size={20} /> },
    { label: "Asset Liquidity", value: "98.5%", growth: "+0.4%", icon: <Activity size={20} /> },
  ];

  const categories = [
    { name: "Gaming & Entertainment", weight: "45%", color: "bg-primary" },
    { name: "Fintech & E-commerce", weight: "30%", color: "bg-secondary" },
    { name: "SaaS & Digital Assets", weight: "15%", color: "bg-tertiary" },
    { name: "Marketplace & Retail", weight: "10%", color: "bg-on-surface-variant/40" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="animate-vapor">
          <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-on-surface uppercase">
            Market <span className="text-primary">Insights</span>
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mt-4 font-medium leading-relaxed">
            Real-time performance metrics and high-fidelity data visualization for the Affiliate Hub PH ecosystem.
          </p>
        </div>

        {/* Core Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-vapor">
          {stats.map((stat, idx) => (
            <GlassCard key={idx} className="p-6 border-primary/5 bg-surface-container-low/40 group hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className={cn(
                  "text-[10px] font-black px-2 py-1 rounded-full",
                  stat.growth.startsWith('+') ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"
                )}>
                  {stat.growth}
                </div>
              </div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-3xl font-black text-on-surface mt-1 font-headline">{stat.value}</h3>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-vapor">
          {/* Main Chart Card */}
          <GlassCard className="lg:col-span-8 p-10 bg-surface-container-low/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BarChart3 size={120} className="text-primary" />
            </div>
            <div className="flex justify-between items-center mb-12 relative z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-on-surface font-headline uppercase tracking-tight">Expansion Velocity</h3>
                <p className="text-sm text-on-surface-variant font-medium">Monthly network growth and node propagation across all sectors.</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-primary text-background rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">30 Days</button>
                <button className="px-4 py-2 border border-outline-variant/30 text-on-surface-variant rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">90 Days</button>
              </div>
            </div>

            <div className="h-64 w-full flex items-end gap-3 px-4 relative z-10 group-hover:scale-[1.01] transition-transform duration-500">
               {[45, 52, 38, 65, 48, 55, 75, 62, 85, 78, 92, 100].map((h, i) => (
                 <div key={i} className="flex-1 flex flex-col gap-2 group/bar">
                    <div className="w-full bg-primary/20 rounded-t-sm group-hover/bar:bg-primary transition-all cursor-crosshair relative" style={{ height: `${h}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover/bar:opacity-100 transition-opacity">
                         {h}%
                      </div>
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="mt-8 flex justify-between px-4 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] border-t border-outline-variant/10 pt-6">
               <span>JAN'24</span>
               <span>JUN'24</span>
               <span>DEC'24</span>
            </div>
          </GlassCard>

          {/* Sector Weight */}
          <GlassCard className="lg:col-span-4 p-8 bg-surface-container-low/40 flex flex-col">
            <div className="flex items-center gap-3 mb-10">
              <PieChart className="text-secondary" size={20} />
              <h3 className="text-xl font-black text-on-surface font-headline uppercase tracking-tight">Sector Weights</h3>
            </div>
            <div className="space-y-6 flex-1">
              {categories.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-on-surface-variant">{cat.name}</span>
                    <span className="text-on-surface">{cat.weight}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", cat.color)} style={{ width: cat.weight }} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-6 rounded-2xl bg-secondary/5 border border-secondary/10">
              <p className="text-[10px] text-secondary font-black leading-relaxed uppercase tracking-widest text-center">
                Kinetic analytics engine reports 100% data integrity for current cycle.
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Feature List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-vapor">
          {[
            { title: "Real-time Audits", desc: "Every transaction and node registration is verified on-chain for total transparency.", icon: <ShieldCheck className="text-emerald-400" /> },
            { title: "Smart Routing", desc: "Automated traffic distribution based on real-time conversion velocity and server load.", icon: <Zap className="text-amber-400" /> },
            { title: "Predictive Flux", desc: "Identify emerging market trends before they reach saturation using AI node analysis.", icon: <TrendingUp className="text-primary" /> },
          ].map((feature, idx) => (
            <GlassCard key={idx} className="p-8 space-y-4 hover:bg-white/5 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h4 className="text-lg font-black text-on-surface font-headline uppercase tracking-tight">{feature.title}</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed font-medium">{feature.desc}</p>
            </GlassCard>
          ))}
        </div>

        {/* CTA */}
        <GlassCard className="p-12 text-center space-y-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 animate-vapor">
          <h2 className="text-4xl font-black font-headline text-on-surface uppercase tracking-tight">Need deep <span className="text-primary">Data Access?</span></h2>
          <p className="text-on-surface-variant max-w-xl mx-auto font-medium">
            Authorized agents with Diamond tier status gain access to secondary node analytics and raw frequency logs.
          </p>
          <div className="flex justify-center gap-6">
            <button className="px-8 py-4 bg-primary text-background rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] transition-all">Upgrade Status</button>
            <button className="px-8 py-4 border border-outline-variant/30 text-on-surface rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
              API Docs <ArrowUpRight size={14} />
            </button>
          </div>
        </GlassCard>
      </main>

      <Footer />
    </div>
  );
}
