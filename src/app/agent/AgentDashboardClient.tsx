"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  BarChart3,
  Check,
  Hourglass,
  Rocket,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Lock,
  Plus,
  Lightbulb,
  ChevronRight,
  Activity,
  Search,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

type Platform = {
  id: string;
  brandId: string;
  brandName: string;
  loginUrl: string;
  username: string;
  password: string;
  status: string;
};

type Announcement = {
  tag: string;
  time: string;
  title: string;
  desc: string;
  color: string;
};

type Props = {
  platforms: Platform[];
  announcements: Announcement[];
  userName: string;
  kycStatus: string;
};

export default function AgentDashboardClient({
  platforms,
  announcements,
  userName,
  kycStatus
}: Props) {
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleReveal = (id: string) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const approvedPlatforms = platforms.filter((p) => p.status === "APPROVED");
  const pendingPlatforms = platforms.filter((p) => p.status !== "APPROVED");

  const kycStep =
    kycStatus === "PENDING" ? 2 :
    kycStatus === "APPROVED" ? 3 :
    kycStatus === "REJECTED" ? -1 : 0;

  const stepStatus = (idx: number) => {
    if (kycStatus === "APPROVED") return idx < 3 ? "done" : "active";
    if (kycStatus === "PENDING") return idx < kycStep ? "done" : idx === kycStep ? "active" : "pending";
    return "pending";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-vapor">
      {/* Left Column */}
      <div className="lg:col-span-8 space-y-10">

        {/* KYC Status Banner */}
        {kycStatus === "REJECTED" && (
          <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertTriangle size={20} />
            <div>
              <p className="font-bold text-sm">Application Rejected</p>
              <p className="text-xs opacity-80">Please contact support or re-apply with correct documents.</p>
            </div>
          </div>
        )}

        {/* Application Status Tracker */}
        <section className="glass-card rounded-2xl p-8 border-l-[6px] border-secondary shadow-[0_0_40px_rgba(110,155,255,0.05)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Activity size={120} className="text-secondary" />
          </div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary ring-1 ring-secondary/20">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-headline font-black text-on-surface uppercase tracking-tight">
                  Application Status
                </h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black mt-1">
                  KYC: {kycStatus}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border",
                kycStatus === "APPROVED"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : kycStatus === "REJECTED"
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              )}
            >
              {kycStatus}
            </span>
          </div>

          <div className="relative flex justify-between items-center px-6 mb-4">
            <div className="absolute top-5 left-10 right-10 h-1 bg-surface-container-highest z-0">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                style={{ width: kycStatus === "APPROVED" ? "100%" : kycStatus === "PENDING" ? "66%" : "33%" }}
              />
            </div>
            {[
              { label: "Account", icon: <Check size={16} />, step: 0 },
              { label: "KYC", icon: <Check size={16} />, step: 1 },
              { label: "CSR Review", icon: <Hourglass size={16} className="animate-pulse" />, step: 2 },
              { label: "Activated", icon: <Rocket size={16} />, step: 3 }
            ].map((step, idx) => {
              const status = stepStatus(idx);
              return (
                <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500",
                      status === "done"
                        ? "bg-primary text-background shadow-[0_0_15px_rgba(129,236,255,0.4)]"
                        : status === "active"
                        ? "bg-secondary text-white ring-4 ring-background shadow-[0_0_20px_rgba(110,155,255,0.4)] scale-110"
                        : "bg-surface-container-highest border border-outline-variant text-on-surface-variant opacity-50"
                    )}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      status === "pending" ? "text-on-surface-variant opacity-50" : "text-on-surface"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Platform Vault */}
        <section className="space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Lock size={20} />
              </div>
              <h2 className="text-2xl font-headline font-black text-on-surface uppercase tracking-tight">
                Platform Vault
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-3 rounded-xl hover:bg-white/5 text-on-surface-variant transition-colors">
                <Search size={20} />
              </button>
            </div>
          </div>

          {platforms.length === 0 && (
            <div className="py-16 text-center text-on-surface-variant">
              <Lock size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold text-sm uppercase tracking-widest opacity-60">
                No platforms assigned yet
              </p>
              <p className="text-xs mt-2 opacity-40">
                Platforms will appear here after your KYC is approved.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {platforms.map((platform, i) => {
              const isApproved = platform.status === "APPROVED";
              const colors = ["primary", "secondary", "tertiary"];
              const color = colors[i % colors.length];
              const isRevealed = revealedPasswords.has(platform.id);

              return (
                <GlassCard
                  key={platform.id}
                  className={cn(
                    "p-6 transition-all duration-500 border-l-4 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)]",
                    isApproved
                      ? color === "primary"
                        ? "border-primary"
                        : color === "secondary"
                        ? "border-secondary"
                        : "border-tertiary"
                      : "border-outline-variant grayscale opacity-70"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-5 min-w-[200px]">
                      <div
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border border-white/5",
                          color === "primary"
                            ? "text-primary bg-primary/10"
                            : color === "secondary"
                            ? "text-secondary bg-secondary/10"
                            : "text-tertiary bg-tertiary/10"
                        )}
                      >
                        {platform.brandName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-headline font-black text-on-surface text-lg uppercase tracking-tight">
                          {platform.brandName}
                        </h4>
                        <span
                          className={cn(
                            "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mt-1 border inline-block",
                            isApproved
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          )}
                        >
                          {platform.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-[0.2em] ml-1">
                          Access URL
                        </p>
                        <p
                          className={cn(
                            "text-xs font-bold truncate",
                            isApproved ? "text-primary" : "text-on-surface/40"
                          )}
                        >
                          {isApproved ? platform.loginUrl || "—" : "Locked"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-[0.2em] ml-1">
                          Username
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold">
                            {isApproved ? platform.username || "—" : "•••••••"}
                          </span>
                          {isApproved && platform.username && (
                            <button
                              onClick={() => copyToClipboard(platform.username, `u-${platform.id}`)}
                              className="text-on-surface-variant hover:text-primary transition-colors"
                              title="Copy username"
                            >
                              {copiedId === `u-${platform.id}` ? (
                                <Check size={12} className="text-emerald-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-[0.2em] ml-1">
                          Password
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono tracking-[0.3em]">
                            {isApproved
                              ? isRevealed
                                ? platform.password || "—"
                                : "••••••••"
                              : "••••••••"}
                          </span>
                          {isApproved && (
                            <>
                              <button
                                onClick={() => toggleReveal(platform.id)}
                                className="text-on-surface-variant hover:text-primary transition-colors"
                                title="Reveal password"
                              >
                                {isRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>
                              {platform.password && (
                                <button
                                  onClick={() => copyToClipboard(platform.password, `p-${platform.id}`)}
                                  className="text-on-surface-variant hover:text-primary transition-colors"
                                  title="Copy password"
                                >
                                  {copiedId === `p-${platform.id}` ? (
                                    <Check size={12} className="text-emerald-400" />
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                </button>
                              )}
                            </>
                          )}
                          {!isApproved && <Lock size={12} className="text-on-surface-variant opacity-50" />}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-end">
                      <button
                        disabled={!isApproved || !platform.loginUrl}
                        onClick={() => isApproved && platform.loginUrl && window.open(`https://${platform.loginUrl}`, "_blank")}
                        className={cn(
                          "px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all duration-300",
                          isApproved && platform.loginUrl
                            ? "bg-primary/5 hover:bg-primary text-primary hover:text-background border border-primary/20"
                            : "bg-white/5 text-on-surface-variant/40 cursor-not-allowed"
                        )}
                      >
                        {isApproved ? "LAUNCH" : "LOCKED"}
                        {isApproved ? <ExternalLink size={14} /> : <Lock size={14} />}
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}

            <div className="rounded-3xl border-2 border-dashed border-outline-variant/30 flex items-center justify-center p-10 hover:border-primary/50 transition-all cursor-pointer group bg-white/[0.01] hover:bg-primary/5">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-background transition-all duration-500">
                  <Plus size={24} />
                </div>
                <div>
                  <p className="font-headline font-black text-on-surface uppercase tracking-tight text-lg">
                    Apply for New Platform
                  </p>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-[0.2em] mt-1">
                    Scale your agent reach across the network
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-4 space-y-10">
        <GlassCard className="p-8 rounded-3xl border-t-[6px] border-tertiary bg-surface-container-low/40 relative overflow-hidden group shadow-2xl hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(166,140,255,0.15)] transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 group-hover:scale-110 group-hover:text-tertiary transition-all duration-700 pointer-events-none">
             <Activity size={80} className="text-tertiary" />
          </div>
          <div className="relative z-10 flex items-center justify-between mb-10">
            <h3 className="text-sm font-headline font-black text-on-surface uppercase tracking-[0.3em]">
              Hub Updates
            </h3>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary shadow-[0_0_10px_#a68cff]"></span>
            </span>
          </div>
          <div className="relative z-10 space-y-8">
            {announcements.map((news, idx) => (
              <div key={idx} className="group cursor-pointer">
                <p className={cn("text-[9px] font-black mb-2 uppercase tracking-[0.2em]", news.color)}>
                  {news.tag} • <span className="opacity-60">{news.time}</span>
                </p>
                <h5 className="text-sm font-black text-on-surface group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">
                  {news.title}
                </h5>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed font-medium">
                  {news.desc}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-8 rounded-3xl bg-gradient-to-br from-surface-container/20 to-surface-container-high/40 border-primary/5 relative overflow-hidden group shadow-2xl hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(129,236,255,0.1)] transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:-rotate-12 group-hover:scale-110 group-hover:text-primary transition-all duration-700 pointer-events-none">
             <Lightbulb size={80} className="text-primary" />
          </div>
          <div className="relative z-10 flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-xl text-primary border border-primary/20">
              <Lightbulb size={20} />
            </div>
            <h3 className="text-sm font-headline font-black text-on-surface uppercase tracking-[0.2em]">
              Access Intel
            </h3>
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex gap-5">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-surface-container flex items-center justify-center text-primary/40">
                <Lock size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-on-surface uppercase tracking-tight">
                  Encrypted Terminal
                </p>
                <p className="text-[10px] text-on-surface-variant mt-1.5 font-bold leading-relaxed">
                  Use Chrome Incognito or Brave Browser for secure sessions.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-surface-container flex items-center justify-center text-secondary/40">
                <Activity size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-on-surface uppercase tracking-tight">
                  Latency Check
                </p>
                <p className="text-[10px] text-on-surface-variant mt-1.5 font-bold leading-relaxed">
                  Ensure pop-ups are authorized for *.vault.ph domains.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* FAB */}
      <button className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-primary text-background shadow-[0_10px_40px_rgba(129,236,255,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[70] group">
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>
    </div>
  );
}
