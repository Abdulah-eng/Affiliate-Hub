"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RotateCw,
  Zap,
  Trophy,
  Smartphone,
  Wallet,
  Coins,
  ChevronRight,
  Star,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  X,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { spinStandardRaffle, spinGrandRaffle } from "@/app/actions/raffle";

const WINNERS = [
  { name: "VaultMaster", prize: "10,000 GCASH!", color: "text-primary" },
  { name: "LuckySpinner", prize: "1,000 CHIPS", color: "text-secondary" },
  { name: "AffiliateKing", prize: "iPhone 15 Pro!", color: "text-tertiary" },
  { name: "JuanDelaCruz", prize: "200 GCASH", color: "text-primary" },
  { name: "RichieRich", prize: "10,000 GCASH!", color: "text-primary" },
  { name: "NexusElite", prize: "1,000 PTS Instant!", color: "text-secondary" },
];

// ─────────────────────────────────────────────────────────────────────────────
// The standard wheel CSS grid quadrant centres are at angles from 12 o'clock:
//   Top-Left  quadrant centre =  -45° (315°) → server label "500 PTS"
//   Top-Right quadrant centre =   45°        → server label "NO WIN"
//   Bot-Left  quadrant centre = -135° (225°) → server label "200 PTS"
//   Bot-Right quadrant centre =  135°        → server label "1000 PTS"
//
// Arrow is at 12 o'clock (top). To make a segment stop at top, we rotate the
// wheel so that segment's centre is at 0°. 
// rotateToTop(segCentre) = -segCentre  (i.e. rotate wheel by -segCentre)
//
// Server stop-angle mapping (matches raffle.ts):
//   500  → stopAngle = 45   → segment centre at  -45° → wheel needs +45°
//   NOWIN→ stopAngle = 135  → segment centre at   45° → wheel needs -45°  (≡315)
//   200  → stopAngle = 225  → segment centre at -135° → wheel needs +135°
//   1000 → stopAngle = 315  → segment centre at  135° → wheel needs -135° (≡225)
//
// Simplified: target = -stopAngle + 360 = 360 - stopAngle (mod 360)
// We add 8 full rotations for drama.
// ─────────────────────────────────────────────────────────────────────────────

// Grand wheel: 4 equal quadrants at 0,90,180,270 from top
// Server: iPhone=0 (top), GCash=90 (right), Chips=180 (bottom), 200GCash=270 (left)
// To stop at top: rotate by -stopAngle  → (360-stopAngle) % 360
// We add 10 full rotations.

interface ToastItem {
  id: number;
  type: "success" | "grand" | "error" | "nowin";
  message: string;
  sub?: string;
}

export function RaffleArenaClient({
  userPoints: initialPoints,
  userTickets: _userTickets,
  standardPrizesJson,
  grandPrizesJson,
}: {
  userPoints: number;
  userTickets: number;
  standardPrizesJson?: string;
  grandPrizesJson?: string;
}) {
  const [userPoints, setUserPoints] = useState(initialPoints);

  // Parse prizes
  const [standardPrizes, setStandardPrizes] = useState<any[]>([]);
  const [grandPrizes, setGrandPrizes] = useState<any[]>([]);

  useEffect(() => {
    try {
      if (standardPrizesJson) setStandardPrizes(JSON.parse(standardPrizesJson));
      else setStandardPrizes([
        { label: "500 PTS", type: "POINTS", val: 500 },
        { label: "NO WIN", type: "POINTS", val: 0 },
        { label: "200 PTS", type: "POINTS", val: 200 },
        { label: "1000 PTS", type: "POINTS", val: 1000 },
      ]);
    } catch {
      setStandardPrizes([
        { label: "500 PTS", type: "POINTS", val: 500 },
        { label: "NO WIN", type: "POINTS", val: 0 },
        { label: "200 PTS", type: "POINTS", val: 200 },
        { label: "1000 PTS", type: "POINTS", val: 1000 },
      ]);
    }

    try {
      if (grandPrizesJson) setGrandPrizes(JSON.parse(grandPrizesJson));
      else setGrandPrizes([
        { label: "iPhone 15+", type: "MANUAL", val: 0 },
        { label: "10k GCash", type: "GCASH", val: 10000 },
        { label: "1k Chips", type: "POINTS", val: 1000 },
        { label: "200 GCash", type: "GCASH", val: 200 },
      ]);
    } catch {
      setGrandPrizes([
        { label: "iPhone 15+", type: "MANUAL", val: 0 },
        { label: "10k GCash", type: "GCASH", val: 10000 },
        { label: "1k Chips", type: "POINTS", val: 1000 },
        { label: "200 GCash", type: "GCASH", val: 200 },
      ]);
    }
  }, [standardPrizesJson, grandPrizesJson]);

  // Standard wheel
  const [isSpinning, setIsSpinning] = useState(false);
  const [standardRotation, setStandardRotation] = useState(0);
  const standardRotRef = useRef(0);

  // Grand wheel
  const [isGrandSpinning, setIsGrandSpinning] = useState(false);
  const [grandRotation, setGrandRotation] = useState(0);
  const grandRotRef = useRef(0);

  // Result modal
  const [modal, setModal] = useState<{ type: "standard" | "grand"; prize: string } | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);

  const addToast = (t: Omit<ToastItem, "id">) => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 5000);
  };

  const removeToast = (id: number) =>
    setToasts(prev => prev.filter(x => x.id !== id));

  // ── Standard Spin ──────────────────────────────────────────────────────────
  const startStandardSpin = async () => {
    if (isSpinning || isGrandSpinning) return;
    setIsSpinning(true);

    const res = await spinStandardRaffle();

    if (res.success) {
      // Align: wheel segment at stopAngle must face the top arrow.
      // Rotate = current + 8 full turns + (360 - stopAngle)
      const extra = (360 - (res.angle ?? 0) + 360) % 360;
      const currentMod = standardRotRef.current % 360;
      const diff = (extra - currentMod + 360) % 360;
      const newRot = standardRotRef.current + 360 * 8 + diff;
      standardRotRef.current = newRot;
      setStandardRotation(newRot);

      // Show result 100ms after animation ends (3 s)
      setTimeout(() => {
        setIsSpinning(false);
        setUserPoints(prev => prev - 1000 + (res.points ?? 0));
        if (res.prize?.toUpperCase().includes("NO WIN")) {
          addToast({ type: "nowin", message: "Result", sub: res.prize || "No Win" });
        } else {
          setModal({ type: "standard", prize: res.prize! });
        }
      }, 3100);
    } else {
      setIsSpinning(false);
      addToast({ type: "error", message: res.error ?? "Spin failed" });
    }
  };

  // ── Grand Spin ─────────────────────────────────────────────────────────────
  const startGrandSpin = async () => {
    if (isSpinning || isGrandSpinning) return;
    setIsGrandSpinning(true);

    const res = await spinGrandRaffle();

    if (res.success) {
      const extra = (360 - (res.angle ?? 0) + 360) % 360;
      const currentMod = grandRotRef.current % 360;
      const diff = (extra - currentMod + 360) % 360;
      const newRot = grandRotRef.current + 360 * 10 + diff;
      grandRotRef.current = newRot;
      setGrandRotation(newRot);

      setTimeout(() => {
        setIsGrandSpinning(false);
        let wonPts = 0;
        if (res.prize?.includes("Chips") || res.prize?.includes("PTS")) wonPts = 1000;
        setUserPoints(prev => prev - 5000 + wonPts);
        setModal({ type: "grand", prize: res.prize! });
      }, 5100);
    } else {
      setIsGrandSpinning(false);
      addToast({ type: "error", message: res.error ?? "Grand Spin failed" });
    }
  };

  return (
    <div className="animate-vapor w-full max-w-full overflow-hidden">

      {/* ── Toast Stack ─────────────────────────────────────────────────── */}
      <div className="fixed top-24 right-6 z-[200] flex flex-col gap-3 max-w-xs w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-4 px-5 py-4 rounded-2xl shadow-2xl border pointer-events-auto animate-in fade-in slide-in-from-right-6 duration-300",
              t.type === "success" && "bg-primary text-background border-primary/40",
              t.type === "grand" && "bg-tertiary text-white border-tertiary/40",
              t.type === "nowin" && "bg-slate-800 text-on-surface border-white/10",
              t.type === "error" && "bg-red-600 text-white border-red-500/40",
            )}
          >
            {t.type === "error" ? <XCircle size={20} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={20} className="shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">{t.message}</p>
              {t.sub && <p className="text-sm font-bold">{t.sub}</p>}
            </div>
            <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Result Modal ─────────────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-background/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={cn(
            "relative max-w-sm w-full mx-4 p-10 rounded-3xl border text-center shadow-2xl animate-in zoom-in-90 duration-500",
            modal.type === "standard" ? "bg-surface-container border-primary/30" : "bg-surface-container border-tertiary/40"
          )}>
            {/* Glow blob */}
            <div className={cn(
              "absolute inset-0 rounded-3xl blur-[60px] opacity-20 pointer-events-none",
              modal.type === "standard" ? "bg-primary" : "bg-tertiary"
            )} />

            <div className="relative z-10 space-y-6">
              <div className={cn(
                "w-24 h-24 rounded-full mx-auto flex items-center justify-center border-2",
                modal.type === "standard" ? "bg-primary/10 border-primary text-primary" : "bg-tertiary/10 border-tertiary text-tertiary"
              )}>
                {modal.type === "grand" ? <Trophy size={48} className="fill-current" /> : <Gift size={48} />}
              </div>

              <div>
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-[0.3em] mb-2",
                  modal.type === "standard" ? "text-primary" : "text-tertiary"
                )}>
                  {modal.type === "standard" ? "Standard Win" : "Grand Arena Win"}
                </p>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-on-surface">{modal.prize}</h2>
                {modal.type === "grand" && modal.prize !== "iPhone 15+" && (
                  <p className="text-xs text-on-surface-variant mt-2 opacity-60">Prize will be credited within 24 hours.</p>
                )}
                {modal.type === "grand" && modal.prize === "iPhone 15+" && (
                  <p className="text-emerald-400 text-sm font-bold mt-2">🎉 MEGA JACKPOT — Contact support to claim!</p>
                )}
              </div>

              <button
                onClick={() => setModal(null)}
                className={cn(
                  "w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all hover:scale-[1.02] active:scale-95",
                  modal.type === "standard"
                    ? "bg-primary text-background hover:shadow-[0_0_30px_rgba(129,236,255,0.4)]"
                    : "bg-gradient-to-r from-tertiary to-secondary text-white hover:shadow-[0_0_30px_rgba(166,140,255,0.4)]"
                )}
              >
                Spin Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Winner Ticker ────────────────────────────────────────────────── */}
      <div className="mb-10 overflow-hidden bg-surface-container-low/40 backdrop-blur-xl py-3.5 rounded-full border border-primary/10 flex items-center px-6 shadow-xl relative w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="flex items-center gap-3 mr-6 shrink-0 text-secondary z-10 border-r border-white/5 pr-6">
          <Star size={14} fill="currentColor" className="animate-pulse" />
          <span className="font-headline font-black text-[9px] uppercase tracking-[0.2em] whitespace-nowrap">Winner's Circle</span>
        </div>
        {/* Wrapping in a flex-1 min-w-0 container prevents this from pushing the parent width */}
        <div className="flex-1 min-w-0 overflow-hidden relative z-10">
          <div className="flex animate-marquee whitespace-nowrap gap-16 text-xs font-bold text-on-surface-variant">
            {[...WINNERS, ...WINNERS].map((w, i) => (
              <span key={i} className="flex items-center gap-2 shrink-0">
                <span className="text-white/30 text-[10px]">●</span>
                {w.name} won <span className={cn("font-black", w.color)}>{w.prize}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

        {/* ── Left: Wheels ──────────────────────────────────────────────── */}
        <div className="xl:col-span-8 space-y-10">

          {/* ── Standard Spin Wheel ─────────────────────────────────────── */}
          <GlassCard className="p-6 sm:p-10 flex flex-col items-center border-primary/20 bg-surface-container-low/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <RotateCw size={140} className="text-primary" />
            </div>

            <div className="text-center mb-10 relative z-10">
              <h2 className="text-4xl font-black font-headline tracking-tighter uppercase mb-2">
                Standard <span className="text-primary">Spin Wheel</span>
              </h2>
              <p className="text-on-surface-variant text-sm font-medium opacity-70">
                Costs <span className="text-primary font-black">1,000 PTS</span> — win up to <span className="text-primary font-black">1,000 PTS</span> instantly.
              </p>
            </div>

            {/* Wheel */}
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] flex items-center justify-center z-10">
              {/* Glow */}
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-[80px] animate-pulse" />
              {/* Outer ring */}
              <div className="absolute inset-[-12px] rounded-full border-[10px] border-surface-container-highest shadow-[0_0_40px_rgba(129,236,255,0.12)] ring-1 ring-primary/20" />

              {/* Spinning disc */}
              <div
                className="w-full h-full rounded-full border-4 border-primary/40 relative overflow-hidden bg-slate-950 shadow-inner"
                style={{
                  transform: `rotate(${standardRotation}deg)`,
                  transition: isSpinning ? "transform 3s cubic-bezier(0.17, 0.67, 0.12, 1)" : "none",
                }}
              >
                {/* 4 Quadrant Segments */}
                {/* Top-Left: 500 PTS (centre at 315°/–45°) */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  <div className="border-r border-b border-primary/20 bg-primary/8 flex items-center justify-center p-4">
                    <span className="text-primary font-black text-xl md:text-2xl -rotate-45 tracking-tighter drop-shadow text-center leading-tight">
                      {standardPrizes[0]?.label || "..."}
                    </span>
                  </div>
                  {/* Top-Right: NO WIN */}
                  <div className="border-l border-b border-white/5 flex items-center justify-center p-4">
                    <span className="text-on-surface-variant/60 font-black text-xs md:text-sm rotate-45 tracking-widest text-center leading-tight">
                      {standardPrizes[1]?.label || "..."}
                    </span>
                  </div>
                  {/* Bot-Left: 200 PTS */}
                  <div className="border-r border-t border-white/5 flex items-center justify-center p-4">
                    <span className="text-on-surface-variant font-black text-xl md:text-2xl -rotate-[135deg] tracking-tighter drop-shadow text-center leading-tight">
                      {standardPrizes[2]?.label || "..."}
                    </span>
                  </div>
                  {/* Bot-Right: 1000 PTS */}
                  <div className="border-l border-t border-secondary/20 bg-secondary/5 flex items-center justify-center p-4">
                    <span className="text-secondary font-black text-xl md:text-2xl rotate-[135deg] tracking-tighter drop-shadow text-center leading-tight">
                      {standardPrizes[3]?.label || "..."}
                    </span>
                  </div>
                </div>

                {/* Centre hub */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-surface-container-high border-2 border-primary shadow-[0_0_20px_#81ecff] z-20 flex items-center justify-center">
                    <Zap size={24} className="text-primary fill-current" />
                  </div>
                </div>
              </div>

              {/* Arrow pointer (stays still) */}
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-10 bg-primary z-30 shadow-[0_0_15px_#81ecff]"
                style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
              />
            </div>

            {/* Controls */}
            <div className="mt-10 flex flex-wrap justify-center gap-4 relative z-10 w-full">
              <div className="bg-slate-950/80 border border-primary/20 px-6 py-4 rounded-2xl">
                <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Balance</p>
                <p className="text-sm font-black text-on-surface">{userPoints.toLocaleString()} PTS</p>
              </div>
              <button
                onClick={startStandardSpin}
                disabled={isSpinning || isGrandSpinning || userPoints < 1000}
                className={cn(
                  "flex-1 max-w-[240px] px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                  isSpinning
                    ? "bg-primary/20 text-primary animate-pulse"
                    : "bg-primary text-background hover:shadow-[0_0_40px_rgba(129,236,255,0.4)] hover:scale-[1.02]"
                )}
              >
                {isSpinning ? <><RotateCw size={14} className="animate-spin" /> SPINNING...</> : "INITIALIZE SPIN"}
              </button>
            </div>

            {userPoints < 1000 && !isSpinning && (
              <p className="mt-4 text-[10px] text-red-400 font-black uppercase tracking-widest animate-pulse">
                Insufficient Points — Need 1,000 PTS
              </p>
            )}
          </GlassCard>

          {/* ── Grand Raffle Wheel ──────────────────────────────────────── */}
          <GlassCard className="p-6 sm:p-10 flex flex-col items-center bg-gradient-to-br from-surface-container-high/80 to-surface-container-low border-tertiary/20 relative overflow-hidden">
            <div className="absolute inset-0 rounded-3xl" style={{ background: "radial-gradient(circle at 50% 50%, rgba(166,140,255,0.08), transparent 70%)" }} />

            <div className="text-center mb-8 relative z-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-tertiary/20 text-tertiary rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4 border border-tertiary/30">
                <ShieldCheck size={12} /> Premium Vault Access
              </span>
              <h2 className="text-5xl font-black font-headline tracking-tighter uppercase mb-1">
                Grand <span className="text-tertiary">Raffle Arena</span>
              </h2>
              <p className="text-on-surface-variant text-sm font-medium italic opacity-70">
                Costs <span className="text-tertiary font-black">5,000 PTS</span> — win legendary physical rewards.
              </p>
            </div>

            {/* Grand Wheel */}
            <div className="relative w-80 h-80 sm:w-[450px] sm:h-[450px] md:w-[520px] md:h-[520px] flex items-center justify-center z-10">
              <div className="absolute inset-0 rounded-full bg-tertiary/15 blur-[100px] animate-pulse-slow" />
              <div className="absolute -inset-4 rounded-full border-2 border-tertiary/20 border-dashed animate-[spin_20s_linear_infinite]" />

              {/* Spinning disc */}
              <div
                className="w-full h-full rounded-full border-[12px] border-slate-900 shadow-[0_0_50px_rgba(166,140,255,0.25)] relative overflow-hidden bg-slate-950 ring-2 ring-tertiary/40"
                style={{
                  transform: `rotate(${grandRotation}deg)`,
                  transition: isGrandSpinning ? "transform 5s cubic-bezier(0.17, 0.67, 0.12, 1)" : "none",
                }}
              >
                {/* Conic gradient for visual flair */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{ background: "conic-gradient(from 0deg, #a68cff 0deg 90deg, #6e9bff 90deg 180deg, #81ecff 180deg 270deg, #a68cff 270deg 360deg)" }}
                />

                {/* Dividers */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-r border-tertiary/20" style={{ left: "50%", right: "auto", width: "1px" }} />
                  <div className="absolute inset-0 border-t border-tertiary/20" style={{ top: "50%", bottom: "auto", height: "1px" }} />
                </div>

                {/* Segment labels — positioned at quadrant centres */}
                <span className="absolute top-10 left-1/2 -translate-x-1/2 font-black text-base md:text-xl text-white tracking-widest uppercase drop-shadow-lg whitespace-nowrap">{grandPrizes[0]?.label || "..."}</span>
                <span className="absolute right-10 top-1/2 -translate-y-1/2 font-black text-base md:text-xl text-white tracking-widest uppercase drop-shadow-lg rotate-90 whitespace-nowrap">{grandPrizes[1]?.label || "..."}</span>
                <span className="absolute bottom-10 left-1/2 -translate-x-1/2 font-black text-base md:text-xl text-white tracking-widest uppercase drop-shadow-lg rotate-180 whitespace-nowrap">{grandPrizes[2]?.label || "..."}</span>
                <span className="absolute left-10 top-1/2 -translate-y-1/2 font-black text-base md:text-xl text-white tracking-widest uppercase drop-shadow-lg -rotate-90 whitespace-nowrap">{grandPrizes[3]?.label || "..."}</span>

                {/* Centre hub */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-slate-950 border-4 border-tertiary shadow-[0_0_30px_#a68cff] z-30 flex items-center justify-center">
                    <Trophy size={32} className="text-tertiary fill-current animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Arrow pointer */}
              <div
                className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-14 bg-tertiary z-40 shadow-[0_0_25px_#a68cff]"
                style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
              />
            </div>

            {/* Controls */}
            <div className="mt-10 flex flex-wrap justify-center gap-6 relative z-10 w-full px-4">
              <div className="bg-slate-950/90 border border-tertiary/30 px-8 py-5 rounded-3xl">
                <p className="text-[10px] font-black text-tertiary uppercase tracking-widest mb-1">Possible Entries</p>
                <p className="text-lg font-black text-on-surface">{Math.floor(userPoints / 5000)} Spins Available</p>
              </div>
              <button
                onClick={startGrandSpin}
                disabled={isSpinning || isGrandSpinning || userPoints < 5000}
                className={cn(
                  "flex-1 max-w-[280px] text-white px-10 py-5 rounded-3xl text-[12px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                  isGrandSpinning
                    ? "bg-tertiary/20 text-tertiary animate-pulse"
                    : "bg-gradient-to-r from-tertiary to-secondary hover:shadow-[0_15px_40px_rgba(166,140,255,0.4)] hover:scale-[1.03]"
                )}
              >
                {isGrandSpinning ? <><RotateCw size={14} className="animate-spin" /> DEPLOYING...</> : "GRAND DEPLOYMENT"}
              </button>
            </div>

            {userPoints < 5000 && !isGrandSpinning && (
              <p className="mt-4 text-[10px] text-tertiary/70 font-black uppercase tracking-widest">
                Need 5,000 PTS — You have {userPoints.toLocaleString()} PTS
              </p>
            )}
          </GlassCard>
        </div>

        {/* ── Right: Info Panel ─────────────────────────────────────────── */}
        <div className="xl:col-span-4 space-y-8">

          {/* Live Balance */}
          <GlassCard className="p-6 border-primary/20 bg-surface-container-low/60">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <Sparkles size={14} /> Your Vault
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Kinetic Points</span>
                <span className="text-primary font-black text-lg">{userPoints.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Standard Spins</span>
                <span className="text-white font-bold">{Math.floor(userPoints / 1000)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Grand Spins</span>
                <span className="text-tertiary font-bold">{Math.floor(userPoints / 5000)}</span>
              </div>
              {/* Progress bar to next grand spin */}
              <div className="pt-2">
                <div className="flex justify-between text-[9px] text-on-surface-variant mb-1.5 font-black uppercase tracking-widest">
                  <span>Next Grand Spin</span>
                  <span>{(userPoints % 5000).toLocaleString()} / 5,000</span>
                </div>
                <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-tertiary to-secondary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((userPoints % 5000) / 5000) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Win Probabilities hidden per admin request */}

          <div className="space-y-4">
            {/* Prize Manifest removed per admin request */}
          </div>
        </div>
      </div>
    </div>
  );
}
