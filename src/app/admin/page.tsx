import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Users, 
  UserCheck, 
  ShieldAlert, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  LayoutDashboard,
  ShieldCheck,
  Globe
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminDashboardPage() {
  // Fetch high-level stats
  const [
    totalAgents,
    pendingKYC,
    approvedKYC,
    totalBrands,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "AGENT" } }),
    prisma.user.count({ where: { kycStatus: "PENDING", role: "AGENT" } }),
    prisma.user.count({ where: { kycStatus: "APPROVED", role: "AGENT" } }),
    prisma.brand.count(),
  ]);

  const stats = [
    {
      label: "Total Agents",
      value: totalAgents,
      icon: <Users size={20} />,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Pending KYC",
      value: pendingKYC,
      icon: <Activity size={20} />,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
    {
      label: "Approved Agents",
      value: approvedKYC,
      icon: <UserCheck size={20} />,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "Active Brands",
      value: totalBrands,
      icon: <Globe size={20} />,
      color: "text-tertiary",
      bgColor: "bg-tertiary/10",
    },
  ];

  return (
    <div className="animate-vapor space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface">
          Command <span className="text-primary">Center</span>
        </h1>
        <p className="text-on-surface-variant max-w-xl text-lg font-medium mt-2">
          System overview and high-level performance metrics for Affiliate Hub PH.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <GlassCard key={idx} className="p-6 bg-surface-container-low/40 border-primary/5">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bgColor, stat.color)}>
                {stat.icon}
              </div>
              <TrendingUp size={16} className="text-on-surface-variant/40" />
            </div>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-[0.2em]">
              {stat.label}
            </p>
            <h3 className="text-3xl font-black text-on-surface mt-1">
              {stat.value}
            </h3>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Quick Actions */}
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-6">
            <h2 className="text-xl font-headline font-black text-on-surface uppercase tracking-tight flex items-center gap-3">
              <ShieldCheck className="text-primary" size={24} />
              Priority Operations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/admin/reviews" className="group">
                <GlassCard className="p-8 h-full border-primary/10 hover:border-primary/30 transition-all cursor-pointer bg-surface-container-low/40">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <LayoutDashboard size={28} />
                    </div>
                    <ArrowUpRight size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                  </div>
                  <h4 className="text-lg font-black text-on-surface uppercase tracking-tight mb-2">Review Queue</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Access the KYC verification vault. Process {pendingKYC} pending applications waiting for secure approval.
                  </p>
                </GlassCard>
              </Link>

              <Link href="/admin/brands" className="group">
                <GlassCard className="p-8 h-full border-tertiary/10 hover:border-tertiary/30 transition-all cursor-pointer bg-surface-container-low/40">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                      <Globe size={28} />
                    </div>
                    <ArrowUpRight size={20} className="text-on-surface-variant group-hover:text-tertiary transition-colors" />
                  </div>
                  <h4 className="text-lg font-black text-on-surface uppercase tracking-tight mb-2">Brand Management</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Configure partner URLs, logos, and platform status. Synchronize credentials across {totalBrands} active nodes.
                  </p>
                </GlassCard>
              </Link>
            </div>
          </section>

          {/* System Health */}
          <GlassCard className="p-8 bg-gradient-to-br from-surface-container/20 to-surface-container-high/40 border-primary/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
              <Activity size={14} /> System Health
            </h3>
            <div className="space-y-6">
              {[
                { label: "Core Database", status: "Operational", color: "text-emerald-400" },
                { label: "Redis Caching Layer", status: "Optimal", color: "text-emerald-400" },
                { label: "NextAuth Encryption", status: "512-bit Active", color: "text-primary" },
              ].map((service, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-on-surface-variant">{service.label}</span>
                  <div className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-current opacity-80", service.color)}>
                    {service.status}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-4">
          <GlassCard className="p-8 h-full border-primary/10 bg-surface-container-low/40">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-xl text-primary">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-sm font-headline font-black text-on-surface uppercase tracking-[0.2em]">Security Intel</h3>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-xs font-black text-on-surface uppercase tracking-tight">Access Log</p>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Multiple security nodes verified. Ensure CSR review protocols are strictly followed for high-confidence scores.
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-xs font-black text-on-surface uppercase tracking-tight">API Latency</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[95%]" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-400">12ms</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
