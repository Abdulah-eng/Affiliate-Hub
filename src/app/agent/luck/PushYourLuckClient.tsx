"use client";

import React, { useState, useEffect } from "react";
import { 
  RotateCw, 
  Banknote, 
  ArrowUp, 
  ArrowDown, 
  Trophy, 
  Ticket, 
  Users, 
  Star,
  Info,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  XCircle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { startLuckGame, spinLuckWheel, bankLuckPoints } from "@/app/actions/luck";

const WHEEL_NUMBERS = [1, 12, 9, 4, 11, 8, 2, 13, 5, 10, 3, 7];
const COLORS = [
  "bg-primary/40", "bg-secondary/40", "bg-tertiary/40", "bg-emerald-500/40",
  "bg-primary/40", "bg-secondary/40", "bg-tertiary/40", "bg-emerald-500/40",
  "bg-primary/40", "bg-secondary/40", "bg-tertiary/40", "bg-emerald-500/40"
];

const RIVALS = [
  { name: 'Master J', points: '2,115', active: true },
  { name: 'Agent Karla', points: '1,359', active: true },
  { name: 'Reckless Rina', points: '890', active: false },
  { name: 'Cautious Kristen', points: '450', active: false },
  { name: 'Meek Megan', points: '120', active: false },
  { name: 'Aggressive Alex', points: '2,400', active: true }
];

export function PushYourLuckClient({ userPoints }: { userPoints: number }) {
  const [status, setStatus] = useState<"IDLE" | "PLAYING" | "WON" | "LOST">("IDLE");
  const [currentNum, setCurrentNum] = useState(6);
  const [roundBank, setRoundBank] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleStart = async () => {
    setIsPending(true);
    setError(null);
    setSuccess(null);
    const res = await startLuckGame();
    if (res.success) {
      setStatus("PLAYING");
      setCurrentNum(res.initialNum!);
      setRoundBank(0);
    } else {
      setError(res.error || "Failed to start");
    }
    setIsPending(false);
  };

  const handleSpin = async (guess: "HIGHER" | "LOWER") => {
    if (isSpinning || isPending) return;
    setIsSpinning(true);
    setError(null);

    const res = await spinLuckWheel(guess);
    if (res.success) {
      // Rotate wheel: 360/12 = 30 deg per segment
      // res.angle is the segment index * 30
      const targetAngle = 360 - (res.angle || 0);
      const newRotation = rotation - (rotation % 360) + (360 * 6) + targetAngle;
      setRotation(newRotation);

      setTimeout(() => {
        setIsSpinning(false);
        setCurrentNum(res.nextNum!);
        if (res.status === "LOST") {
          setStatus("LOST");
        } else {
          setRoundBank(res.roundBank!);
        }
      }, 2500);
    } else {
      setIsSpinning(false);
      setError(res.error || "Spin failed");
    }
  };

  const handleBank = async () => {
    if (status !== "PLAYING" || roundBank === 0 || isPending) return;
    setIsPending(true);
    const res = await bankLuckPoints();
    if (res.success) {
      setStatus("WON");
      setSuccess(`Banked ${res.totalWon} PTS!`);
    } else {
      setError(res.error || "Bank failed");
    }
    setIsPending(false);
  };

  return (
    <div className="animate-vapor pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Sidebar: Arena Rivals */}
        <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
          <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.4em] ml-2 mb-6">Arena Rivals</h3>
          {RIVALS.map((rival, idx) => (
            <div key={idx} className={cn(
              "p-4 rounded-2xl flex items-center justify-between border transition-all",
              rival.active ? "bg-white/5 border-primary/20" : "bg-black/20 border-white/5 opacity-50"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                  <Star size={16} className={rival.active ? "text-primary" : "text-white/20"} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">{rival.name}</p>
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase">{rival.active ? "Deploying" : "Sidelined"}</p>
                </div>
              </div>
              <span className="text-sm font-black text-primary">{rival.points}</span>
            </div>
          ))}
        </div>

        {/* Main Arena: The Wheel */}
        <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-center">
          <div className="text-center mb-10 space-y-2">
             <h2 className="text-4xl font-black font-headline tracking-tighter uppercase whitespace-nowrap">Push Your <span className="text-emerald-400">Luck</span></h2>
             <p className="text-on-surface-variant text-xs font-black uppercase tracking-widest opacity-60">A Node Probability Game</p>
          </div>

          <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
             {/* Glow / Background Effects */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent blur-[60px] animate-pulse-slow"></div>
             
             {/* The Wheel */}
             <div 
               className="w-full h-full rounded-full border-[10px] border-slate-900 shadow-3xl relative overflow-hidden flex items-center justify-center bg-slate-950 transition-transform"
               style={{ 
                 transform: `rotate(${rotation}deg)`,
                 transition: isSpinning ? 'transform 2.5s cubic-bezier(0.2, 0, 0.2, 1)' : 'none'
               }}
             >
                {/* Segments Mapping */}
                {WHEEL_NUMBERS.map((num, i) => (
                   <div key={i} className="absolute inset-0 origin-center" style={{ transform: `rotate(${i * 30}deg)` }}>
                      <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1/2 pt-4 flex flex-col items-center", COLORS[i])} style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}>
                         <span className="text-lg font-black font-mono rotate-180 mb-2">{num}</span>
                      </div>
                   </div>
                ))}

                {/* Center Core */}
                <div className="absolute w-28 h-28 rounded-full bg-slate-950 border-4 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] z-10 flex items-center justify-center transform-gpu" style={{ transform: `rotate(${-rotation}deg)` }}>
                   <span className="text-5xl font-black text-white drop-shadow-lg">{currentNum}</span>
                </div>
             </div>

             {/* Top Pointer */}
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-14 bg-white z-20 shadow-[0_0_20px_#fff]" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
          </div>

          {/* Status Message */}
          <div className="mt-12 h-10 flex items-center justify-center">
            {status === "PLAYING" && (
              <p className="text-lg font-black uppercase tracking-tighter animate-in fade-in slide-in-from-bottom-2">
                Will the next spin be <span className="text-emerald-400">HIGHER</span> or <span className="text-primary">LOWER</span> than {currentNum}?
              </p>
            )}
            {status === "LOST" && <p className="text-lg font-black uppercase tracking-tighter text-red-500 animate-bounce">ELIMINATED! Game Over.</p>}
            {status === "WON" && <p className="text-lg font-black uppercase tracking-tighter text-emerald-400 animate-bounce">SECURED! Points Banked.</p>}
          </div>

          {/* Controls */}
          <div className="mt-10 grid grid-cols-3 gap-6 w-full max-w-xl">
            <button 
              onClick={handleBank} 
              disabled={status !== "PLAYING" || roundBank === 0 || isSpinning || isPending}
              className="bg-slate-900 border border-white/10 hover:border-emerald-500/40 p-6 rounded-3xl flex flex-col items-center gap-2 group transition-all disabled:opacity-30"
            >
              <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1">Secure</div>
              <div className="text-xl font-black text-emerald-400 group-hover:scale-110 transition-transform">BANK</div>
              <div className="text-[9px] font-bold text-on-surface-variant">Collect {roundBank} PTS</div>
            </button>

            <button 
              onClick={() => handleSpin('LOWER')} 
              disabled={status !== "PLAYING" || isSpinning || isPending}
              className="bg-amber-500 text-background p-6 rounded-3xl flex flex-col items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.3)] disabled:opacity-30"
            >
              <ArrowDown size={32} />
              <div className="text-xl font-black leading-none">LOWER</div>
            </button>

            <button 
              onClick={() => handleSpin('HIGHER')} 
              disabled={status !== "PLAYING" || isSpinning || isPending}
              className="bg-primary text-background p-6 rounded-3xl flex flex-col items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(129,236,255,0.3)] disabled:opacity-30"
            >
              <ArrowUp size={32} />
              <div className="text-xl font-black leading-none">HIGHER</div>
            </button>
          </div>

          {!status || status === "WON" || status === "LOST" || status === "IDLE" ? (
             <button 
               onClick={handleStart}
               disabled={isPending}
               className="mt-10 px-12 py-5 bg-white text-background rounded-2xl font-black uppercase tracking-[0.4em] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all hover:scale-[1.05] active:scale-95 disabled:opacity-50"
             >
               {isPending ? 'DEPLOYING...' : 'INITIATE GAME'}
             </button>
          ) : null}
        </div>

        {/* Right Sidebar: Status & Stats */}
        <div className="lg:col-span-3 space-y-6 order-3">
          <GlassCard className="p-6 bg-surface-container-high/40 border-white/10">
             <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-6 flex items-center gap-2"><Trophy size={14} className="text-amber-500" /> Current Session</h3>
             <div className="space-y-6">
                <div>
                   <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-50">Round Bank</p>
                   <p className="text-3xl font-black text-white">{roundBank} <span className="text-xs text-on-surface-variant">PTS</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-50">Multiplier Potential</p>
                  <p className="text-xl font-black text-emerald-400">{(1 + (roundBank / 1000)).toFixed(2)}x</p>
                </div>
                <div className="pt-4 border-t border-white/5">
                   <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Tickets Remaining</p>
                   <div className="flex gap-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={cn("w-6 h-3 rounded-full bg-white/10", i === 1 && "bg-primary animate-pulse")} />
                      ))}
                   </div>
                </div>
             </div>
          </GlassCard>

          <GlassCard className="p-6 bg-emerald-500/5 border-emerald-500/20">
             <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={20} className="text-emerald-400" />
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Growth Intel</h3>
             </div>
             <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
               Lower numbers (1-3) have high probability for <span className="text-primary font-bold">HIGHER</span> spin. Use probability matrix to maximize your banking strategy.
             </p>
          </GlassCard>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
              <XCircle size={16} />
              <p className="text-[9px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400">
              <CheckCircle2 size={16} />
              <p className="text-[9px] font-black uppercase tracking-widest">{success}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
