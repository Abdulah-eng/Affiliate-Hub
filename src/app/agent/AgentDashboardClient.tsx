"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  AlertTriangle,
  MonitorPlay,
  X,
  Gift,
  Zap,
  Clock,
  MessageSquare,
  ThumbsUp,
  Coins,
  ImageIcon,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

type Platform = {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo: string | null;
  loginUrl: string;
  playerLoginUrl: string;
  useIframe: boolean;
  username: string;
  password: string;
  playerUsername: string;
  playerPassword: string;
  status: string;
};

type Promo = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  requiresVerification: boolean;
  pointsAward: number;
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
  promos: Promo[];
  userName: string;
  kycStatus: string;
  dailyTasks: { key: string; count: number }[];
};

export default function AgentDashboardClient({
  platforms,
  announcements,
  promos,
  userName,
  kycStatus,
  dailyTasks
}: Props) {
  const tasks = [
    { key: "DAILY_LOGIN", label: "Daily Sign-in", reward: "50 PTS", target: 1, icon: <Clock size={16} />, color: "text-primary" },
    { key: "FIRST_CHAT", label: "First Agent Interaction", reward: "100 PTS", target: 1, icon: <MessageSquare size={16} />, color: "text-secondary" },
    { key: "CHAT_LIKES", label: "Community Support", reward: "250 PTS", target: 5, icon: <ThumbsUp size={16} />, color: "text-tertiary" },
    { key: "DAILY_SURVIVAL", label: "Daily Survival Kit", reward: "200 GCASH", target: 1, icon: <Gift size={16} />, color: "text-amber-400" },
  ];

  const getTaskCount = (key: string) => dailyTasks.find(t => t.key === key)?.count || 0;

  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [launchPlatform, setLaunchPlatform] = useState<Platform | null>(null);
  const [activePromo, setActivePromo] = useState<Promo | null>(null);
  // Track which tab (agent/player) is shown per platform
  const [platformTab, setPlatformTab] = useState<Record<string, 'agent' | 'player'>>({});
  
  const [promoProof, setPromoProof] = useState<File | null>(null);
  const [promoProofPreview, setPromoProofPreview] = useState<string | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Helper: ensure URL always has exactly one https:// prefix
  const safeUrl = (url: string) => {
    if (!url) return '';
    const cleaned = url.replace(/^(https?:\/\/)+/, '');
    return `https://${cleaned}`;
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 animate-vapor">
      {/* Left Column */}
      <div className="lg:col-span-8 space-y-6 md:space-y-10">

        {/* KYC Status Banner */}
        {kycStatus === "REJECTED" && (
          <div className="flex items-center justify-between gap-4 px-6 py-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <div className="flex items-center gap-4">
              <AlertTriangle size={24} />
              <div>
                <p className="font-black text-sm uppercase tracking-tight">Application Rejected / Needs Reupload</p>
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-80 mt-1">Please provide correct documents to continue.</p>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/apply'}
              className="px-6 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-300 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-colors border border-red-500/30 whitespace-nowrap"
            >
              Request Reupload
            </button>
          </div>
        )}

        {/* Application Status Tracker */}
        <section className="glass-card rounded-2xl p-4 sm:p-8 border-l-[6px] border-secondary shadow-[0_0_40px_rgba(110,155,255,0.05)] relative overflow-hidden group">
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

          <div className="relative flex justify-between items-center px-2 sm:px-6 mb-4">
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
              const tab = platformTab[platform.id] || 'agent';

              return (
                <GlassCard
                  key={platform.id}
                  className={cn(
                    "p-4 sm:p-6 transition-all duration-500 border-l-4 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)]",
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
                          "w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border border-white/5 shadow-inner",
                          color === "primary"
                            ? "bg-primary/10"
                            : color === "secondary"
                            ? "bg-secondary/10"
                            : "bg-tertiary/10"
                        )}
                      >
                        {platform.brandLogo ? (
                          <div className="relative w-full h-full p-2">
                            <Image 
                              src={platform.brandLogo} 
                              alt={platform.brandName} 
                              fill
                              className="object-contain" 
                            />
                          </div>
                        ) : (
                          <span className={cn("text-xl font-black uppercase", 
                            color === "primary" ? "text-primary" : color === "secondary" ? "text-secondary" : "text-tertiary"
                          )}>
                            {platform.brandName.slice(0, 2)}
                          </span>
                        )}
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

                    {/* Agent / Player tab toggle */}
                    {isApproved && (
                      <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5 shrink-0">
                        <button
                          onClick={() => setPlatformTab(prev => ({ ...prev, [platform.id]: 'agent' }))}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                            tab === 'agent' ? "bg-primary text-background shadow" : "text-on-surface-variant hover:text-white"
                          )}
                        >
                          Agent Login
                        </button>
                        <button
                          onClick={() => setPlatformTab(prev => ({ ...prev, [platform.id]: 'player' }))}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                            tab === 'player' ? "bg-secondary text-background shadow" : "text-on-surface-variant hover:text-white"
                          )}
                        >
                          Player Login
                        </button>
                      </div>
                    )}

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-[0.2em] ml-1">
                          {tab === 'agent' ? 'Agent URL' : 'Player URL'}
                        </p>
                        <p
                          className={cn(
                            "text-xs font-bold truncate",
                            isApproved ? "text-primary" : "text-on-surface/40"
                          )}
                        >
                          {isApproved 
                            ? (tab === 'agent' ? platform.loginUrl : platform.playerLoginUrl) || "—" 
                            : "Locked"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-[0.2em] ml-1">
                          {tab === 'agent' ? 'Agent Username' : 'Player Username'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold">
                            {isApproved 
                              ? tab === 'agent' 
                                ? (platform.username || "—") 
                                : (platform.playerUsername || "Contact admin")
                              : "•••••••"}
                          </span>
                          {isApproved && ((tab === 'agent' && platform.username) || (tab === 'player' && platform.playerUsername)) && (
                            <button
                              onClick={() => copyToClipboard(
                                tab === 'agent' ? platform.username : platform.playerUsername, 
                                `u-${platform.id}`
                              )}
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
                      <div className="space-y-1 relative">
                        <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-[0.2em] ml-1">
                          {tab === 'agent' ? 'Agent Password' : 'Player Password'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono tracking-[0.3em]">
                            {isApproved
                              ? isRevealed
                                ? (tab === 'agent' ? platform.password : platform.playerPassword) || "—"
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
                              {((tab === 'agent' && platform.password) || (tab === 'player' && platform.playerPassword)) && (
                                <button
                                  onClick={() => copyToClipboard(
                                    tab === 'agent' ? platform.password : platform.playerPassword, 
                                    `p-${platform.id}`
                                  )}
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
                        {isApproved && platform.password && (
                          <div className="absolute top-12 left-0 mt-2 text-[8px] text-amber-500 font-bold uppercase tracking-widest leading-tight opacity-80">
                            * One-time password.<br/>
                            Change on partner site.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-end">
                      <button
                        disabled={!isApproved || (tab === 'agent' ? !platform.loginUrl : !platform.playerLoginUrl)}
                        onClick={() => {
                          const targetUrl = tab === 'agent' ? platform.loginUrl : platform.playerLoginUrl;
                          if (!isApproved || !targetUrl) return;
                          
                          if (platform.useIframe) {
                            setLaunchPlatform({ ...platform, loginUrl: targetUrl });
                          } else {
                            window.open(safeUrl(targetUrl), "_blank");
                          }
                        }}
                        className={cn(
                          "px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all duration-300",
                          isApproved && (tab === 'agent' ? platform.loginUrl : platform.playerLoginUrl)
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

            <Link href="/agent/platforms" className="rounded-3xl border-2 border-dashed border-outline-variant/30 flex items-center justify-center p-10 hover:border-primary/50 transition-all cursor-pointer group bg-white/[0.01] hover:bg-primary/5">
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
            </Link>
          </div>
        </section>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-4 space-y-10">
        
        {/* Daily Bonus Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-headline font-black text-on-surface-variant uppercase tracking-[0.3em] ml-1">
            Daily Goals
          </h3>
          <GlassCard className="p-6 bg-surface-container-low/40 border-primary/10 overflow-hidden relative">
            <div className="absolute -top-6 -right-6 opacity-5 rotate-12">
               <Zap size={100} className="text-primary" />
            </div>
            <div className="space-y-4 relative z-10">
              {tasks.map((task) => {
                const count = getTaskCount(task.key);
                const isDone = count >= task.target;
                return (
                  <div key={task.key} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/[0.08]">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                      isDone ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-surface-container text-on-surface-variant border-outline-variant/30"
                    )}>
                      {isDone ? <Check size={18} /> : task.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-black uppercase tracking-tight truncate", isDone ? "text-on-surface-variant/40 line-through" : "text-on-surface")}>
                        {task.label}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                           <div 
                             className={cn("h-full transition-all duration-1000", isDone ? "bg-emerald-500" : "bg-primary")} 
                             style={{ width: `${Math.min(100, (count / task.target) * 100)}%` }} 
                           />
                        </div>
                        <span className="text-[9px] font-black text-on-surface-variant">{count}/{task.target}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                       <p className={cn("text-[10px] font-black uppercase tracking-widest", isDone ? "text-emerald-400" : task.color)}>
                         {task.reward}
                       </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Promos Section */}
        {promos.length > 0 && (
          <div className="space-y-6">
             <h3 className="text-sm font-headline font-black text-on-surface-variant uppercase tracking-[0.3em] ml-1">
              Active Promos
            </h3>
            {promos.map(promo => (
              <GlassCard 
                key={promo.id} 
                className="group cursor-pointer p-0 overflow-hidden border-primary/10 hover:border-primary/40 transition-all"
                onClick={() => setActivePromo(promo)}
              >
                <div className="aspect-[16/9] relative overflow-hidden">
                   {promo.imageUrl ? (
                     <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                     <div className="w-full h-full bg-slate-900 flex items-center justify-center text-primary/20">
                       <MonitorPlay size={48} />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                </div>
                <div className="p-5">
                   <h4 className="font-black text-on-surface uppercase tracking-tight text-sm group-hover:text-primary transition-colors">{promo.title}</h4>
                   <p className="text-[10px] text-on-surface-variant mt-1 font-bold uppercase tracking-widest">Click for instructions</p>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

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


      {/* Iframe Modal */}
      {launchPlatform && (
         <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col">
           <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <MonitorPlay size={24} />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-on-surface uppercase tracking-tight">{launchPlatform.brandName} Portal</h2>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Secure Terminal Session Active</p>
                 </div>
              </div>
              <button 
                onClick={() => setLaunchPlatform(null)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-on-surface-variant"
              >
                <X size={24} />
              </button>
           </div>
           <div className="flex-1 bg-black min-h-0 relative">
              <iframe 
                src={safeUrl(launchPlatform.loginUrl)} 
                className="absolute inset-0 w-full h-full border-none"
                title={launchPlatform.brandName}
                allow="fullscreen"
              />
           </div>
         </div>
      )}

      {/* Promo Instructions Detail Modal */}
      {activePromo && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
           <GlassCard className="max-w-xl w-full p-4 sm:p-8 space-y-6 animate-vapor max-h-[90vh] overflow-y-auto no-scrollbar my-auto">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-3xl font-black font-headline text-on-surface uppercase tracking-tight">{activePromo.title}</h2>
                 <button onClick={() => { setActivePromo(null); setSubmissionSuccess(false); setPromoProof(null); setPromoProofPreview(null); }} className="p-2 text-on-surface-variant hover:text-white transition-colors">
                   <X size={24} />
                 </button>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden mb-6 border border-white/10 bg-slate-950">
                 {activePromo.imageUrl ? (
                   <img src={activePromo.imageUrl} alt={activePromo.title} className="w-full h-full object-contain" />
                 ) : (
                   <div className="w-full h-full bg-slate-900 flex items-center justify-center text-primary/20">
                     <MonitorPlay size={64} />
                   </div>
                 )}
              </div>
              
              <div className="p-6 bg-surface-container-low rounded-2xl border border-white/5 space-y-3">
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Lightbulb size={12} /> Poster Instructions
                 </p>
                 <p className="text-sm font-medium text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {activePromo.description || "No specific instructions provided. Please consult support if needed."}
                 </p>
              </div>

              {activePromo.requiresVerification && !submissionSuccess && (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-dashed border-primary/20 rounded-2xl flex flex-col items-center gap-3">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Verification Proof Required</p>
                    <p className="text-[9px] text-on-surface-variant uppercase font-bold text-center">Upload a screenshot of the completed task to redeem {activePromo.pointsAward} PTS</p>
                    
                    <div className="relative w-full">
                       <input 
                         type="file" 
                         accept="image/*"
                         disabled={isSubmittingProof}
                         onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                             setPromoProof(file);
                             setPromoProofPreview(URL.createObjectURL(file));
                           }
                         }}
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                       />
                       <div className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface-variant flex items-center justify-center gap-2 text-xs font-bold uppercase transition-all hover:border-primary/40">
                         {promoProof ? <span className="text-primary truncate">{promoProof.name}</span> : <><ImageIcon size={16} /> Select Screenshot</>}
                       </div>
                    </div>
                    {promoProofPreview && (
                      <div className="h-32 w-full rounded-xl overflow-hidden border border-white/10">
                        <img src={promoProofPreview} className="w-full h-full object-contain" alt="Preview" />
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={async () => {
                      if (!promoProof) return;
                      setIsSubmittingProof(true);
                      const formData = new FormData();
                      formData.append("promoId", activePromo.id);
                      formData.append("file", promoProof);
                      
                      const { submitPromoProof } = await import("@/app/actions/promos");
                      const res = await submitPromoProof(formData);
                      setIsSubmittingProof(false);
                      if (res.success) {
                        setSubmissionSuccess(true);
                      } else {
                        alert("Submission failed: " + res.error);
                      }
                    }}
                    disabled={!promoProof || isSubmittingProof}
                    className="w-full py-4 bg-primary text-background rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSubmittingProof ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Deploy Proof & Redeem"}
                  </button>
                </div>
              )}

              {submissionSuccess && (
                <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center text-center gap-3">
                   <div className="w-12 h-12 rounded-full bg-emerald-500 text-background flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                      <Check size={24} />
                   </div>
                   <div>
                      <h4 className="font-black text-emerald-400 uppercase tracking-tight">Proof Submitted</h4>
                      <p className="text-[10px] text-emerald-400/60 uppercase font-black tracking-widest mt-1">Pending Nexus Admin Review</p>
                   </div>
                </div>
              )}

              {!activePromo.requiresVerification && (
                <button 
                  onClick={() => setActivePromo(null)}
                  className="w-full py-4 bg-primary text-background rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Understood
                </button>
              )}
           </GlassCard>
        </div>
      )}

      {/* FAB */}
      <Link href="/agent/platforms" className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-primary text-background shadow-[0_10px_40px_rgba(129,236,255,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[70] group">
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
      </Link>
    </div>
  );
}
