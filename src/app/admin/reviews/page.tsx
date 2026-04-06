import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Clock,
  UserCheck,
  ShieldAlert,
  ChevronRight,
  Search,
  Filter,
  Users
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function ReviewListPage() {
  // Fetch all KYC applicants from the database
  const [pending, approved24h, all] = await Promise.all([
    prisma.user.count({ where: { kycStatus: "PENDING", role: "AGENT" } }),
    prisma.user.count({
      where: {
        kycStatus: "APPROVED",
        kycReviewedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    }),
    prisma.user.findMany({
      where: { role: "AGENT" },
      orderBy: { kycSubmittedAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        kycStatus: true,
        kycSubmittedAt: true,
        location: true
      }
    })
  ]);

  const flagged = all.filter((u: any) => u.kycStatus === "REJECTED").length;

  const statusColor = (s: string) => {
    if (s === "PENDING") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (s === "APPROVED") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (s === "REJECTED") return "bg-red-500/10 text-red-400 border-red-500/20";
    return "bg-primary/10 text-primary border-primary/20";
  };

  const dotColor = (s: string) => {
    if (s === "PENDING") return "bg-amber-500";
    if (s === "APPROVED") return "bg-emerald-500";
    if (s === "REJECTED") return "bg-red-500";
    return "bg-primary";
  };

  const timeAgo = (date: Date | null) => {
    if (!date) return "Unknown";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="animate-vapor">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface">
            Application <span className="text-primary">Reviews</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg font-medium mt-2">
            Monitor and process incoming affiliate applications. High-precision
            KYC validation at your fingertips.
          </p>
        </div>
      </div>

      {/* Stats HUD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <GlassCard className="p-4 flex items-center gap-4 bg-surface-container-low/40">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">
              Pending
            </p>
            <p className="text-2xl font-black text-on-surface">{pending}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4 bg-surface-container-low/40">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">
              Approved (24h)
            </p>
            <p className="text-2xl font-black text-on-surface">{approved24h}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4 bg-surface-container-low/40">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">
              Rejected
            </p>
            <p className="text-2xl font-black text-on-surface">{flagged}</p>
          </div>
        </GlassCard>

        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors"
              size={18}
            />
            <input
              className="w-full h-full bg-surface-container-low/40 border border-outline-variant/30 focus:border-primary/50 text-sm rounded-2xl pl-12 pr-4 transition-all outline-none text-on-surface"
              placeholder="Search applicant..."
            />
          </div>
          <button className="p-4 bg-surface-container-high rounded-2xl text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <GlassCard className="rounded-2xl p-0 overflow-hidden border-primary/5 bg-surface-container-low/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">
                  Applicant
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">
                  Email
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">
                  Submitted
                </th>
                <th className="px-8 py-5 text-right pr-8 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {all.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center text-on-surface-variant"
                  >
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold text-sm uppercase tracking-widest opacity-60">
                      No applications yet
                    </p>
                  </td>
                </tr>
              )}
              {all.map((app: any) => (
                <tr
                  key={app.id}
                  className="group hover:bg-white/5 transition-colors duration-500"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg shrink-0">
                        {(app.name || app.username || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-on-surface font-headline tracking-tight text-base">
                          {app.name || app.username || "Unknown"}
                        </p>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                          @{app.username} • {app.location || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-on-surface-variant">
                      {app.email}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-full border w-fit font-black uppercase tracking-widest text-[10px]",
                        statusColor(app.kycStatus)
                      )}
                    >
                      <span
                        className={cn("w-2 h-2 rounded-full", dotColor(app.kycStatus))}
                      />
                      {app.kycStatus}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-medium text-on-surface-variant">
                      {timeAgo(app.kycSubmittedAt)}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link
                      href={`/admin/reviews/${app.id}`}
                      className="px-6 py-2.5 bg-surface-container-high hover:bg-primary text-on-surface-variant hover:text-background border border-outline-variant/30 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 inline-flex items-center gap-2"
                    >
                      Review <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
