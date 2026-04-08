"use client";

import React, { useState, useEffect } from "react";
import { 
  Bomb, 
  Gem, 
  Coins, 
  ShieldCheck, 
  ChevronRight, 
  RotateCw, 
  AlertTriangle,
  Trophy,
  History,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { startMinesGame, revealMinesTile, cashOutMines } from "@/app/actions/mines";

export function MinesClient({ userPoints }: { userPoints: number }) {
  const [betAmount, setBetAmount] = useState(100);
  const [mineCount, setMineCount] = useState(3);
  const [status, setStatus] = useState<"IDLE" | "PLAYING" | "WON" | "LOST">("IDLE");
  const [revealed, setRevealed] = useState<number[]>([]);
  const [board, setBoard] = useState<(boolean | null)[]>(new Array(25).fill(null));
  const [multiplier, setMultiplier] = useState(1.0);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalTiles = 25;

  const handleStart = async () => {
    if (userPoints < betAmount) {
      setError("Insufficient points");
      return;
    }
    setIsPending(true);
    setError(null);
    
    const res = await startMinesGame(betAmount, mineCount);
    if (res.success) {
      setStatus("PLAYING");
      setRevealed([]);
      setBoard(new Array(25).fill(null));
      setMultiplier(1.0);
    } else {
      setError(res.error || "Failed to start game");
    }
    setIsPending(false);
  };

  const handleTileClick = async (idx: number) => {
    if (status !== "PLAYING" || revealed.includes(idx) || isPending) return;
    
    setIsPending(true);
    const res = await revealMinesTile(idx);
    
    if (res.success) {
      if (res.status === "LOST") {
        setStatus("LOST");
        setRevealed(res.revealed!);
        // Map true to bomb, false to gem for all tiles
        const newBoard = res.board!.map((isMine: boolean) => isMine);
        setBoard(newBoard);
      } else {
        setRevealed(res.revealed!);
        setMultiplier(res.multiplier!);
        const newBoard = [...board];
        newBoard[idx] = false; // Mark as gem
        setBoard(newBoard);
      }
    } else {
      setError(res.error || "Move failed");
    }
    setIsPending(false);
  };

  const handleCashOut = async () => {
    if (status !== "PLAYING" || revealed.length === 0 || isPending) return;
    
    setIsPending(true);
    const res = await cashOutMines();
    if (res.success) {
      setStatus("WON");
    } else {
      setError(res.error || "Cash out failed");
    }
    setIsPending(false);
  };

  return (
    <div className="animate-vapor pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Settings Panel */}
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
          <GlassCard className="p-8 space-y-8 border-primary/20 bg-surface-container-low/40 h-full">
            <div>
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <ShieldCheck size={16} /> Strategy Config
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    <span>Bet Amount</span>
                    <span className="text-primary">{betAmount} PTS</span>
                  </div>
                  <div className="relative group">
                    <input 
                      type="number" 
                      value={betAmount} 
                      onChange={e => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      disabled={status === "PLAYING"}
                      className="w-full bg-slate-950/60 border border-white/10 px-6 py-4 rounded-2xl text-lg font-black text-on-surface focus:border-primary/40 focus:ring-1 ring-primary/20 transition-all outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                      <button onClick={() => setBetAmount(Math.floor(betAmount/2))} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-tighter">1/2</button>
                      <button onClick={() => setBetAmount(betAmount*2)} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-tighter">2x</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    <span>Mines Count</span>
                    <span className="text-secondary">{mineCount} Bombs</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 3, 5, 10, 24].map(n => (
                      <button 
                        key={n}
                        onClick={() => setMineCount(n)}
                        disabled={status === "PLAYING"}
                        className={cn(
                          "py-3 rounded-xl text-xs font-black transition-all border",
                          mineCount === n ? "bg-secondary text-background border-secondary" : "bg-white/5 border-white/5 hover:border-secondary/30"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              {status === "IDLE" || status === "WON" || status === "LOST" ? (
                <button 
                  onClick={handleStart}
                  disabled={isPending}
                  className="w-full bg-primary text-background py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:shadow-[0_0_40px_rgba(129,236,255,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {isPending ? 'DEPLOYING...' : 'START GAME'}
                </button>
              ) : (
                <button 
                  onClick={handleCashOut}
                  disabled={isPending || revealed.length === 0}
                  className="w-full bg-emerald-500 text-background py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {isPending ? 'SYNCHING...' : `CASH OUT (${multiplier}x)`}
                </button>
              )}
              
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
                  <AlertTriangle size={16} />
                  <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
              )}
            </div>
            
            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03]">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Coins size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Your Balance</p>
                  <p className="text-sm font-black text-on-surface">{userPoints.toLocaleString()} PTS</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Game Canvas */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="relative">
            {/* Header / Stats Overlay */}
            <div className="mb-8 flex justify-between items-end px-4">
               <div>
                 <h2 className="text-4xl font-black font-headline tracking-tighter uppercase leading-none">Kinetic <span className="text-secondary text-5xl">Mines</span></h2>
                 <p className="text-on-surface-variant text-sm font-medium mt-1 opacity-70">Gems & Bombs Arena</p>
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Multiplier</p>
                 <p className={cn("text-3xl font-black transition-all", multiplier > 1 ? "text-emerald-400 scale-110" : "text-on-surface")}>{multiplier.toFixed(2)}x</p>
               </div>
            </div>

            {/* $5 x 5$ Grid */}
            <div className="grid grid-cols-5 gap-3 max-w-[600px] mx-auto perspective-[1000px]">
              {new Array(25).fill(null).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleTileClick(i)}
                  disabled={status !== "PLAYING" || revealed.includes(i) || isPending}
                  className={cn(
                    "aspect-square rounded-2xl flex items-center justify-center transition-all duration-500 relative transform-gpu",
                    status === "PLAYING" && !revealed.includes(i) ? "bg-surface-container-high border-2 border-white/5 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1 active:scale-90" : "",
                    revealed.includes(i) ? "rotate-y-180" : "",
                    board[i] === false && "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.2)]",
                    board[i] === true && "bg-red-500/20 border-red-500/40 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                  )}
                >
                  <div className={cn("transition-all duration-500", revealed.includes(i) ? "opacity-100 scale-100" : "opacity-0 scale-50")}>
                    {board[i] === true && <Bomb size={24} className="fill-current" />}
                    {board[i] === false && <Gem size={28} className="fill-current drop-shadow-[0_0_10px_#10b981]" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Overlays */}
            {status === "WON" && (
               <div className="absolute inset-x-0 inset-y-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md rounded-3xl animate-in fade-in duration-500 pointer-events-none">
                  <div className="text-center p-10 space-y-6">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-background shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                      <Trophy size={48} />
                    </div>
                    <h2 className="text-4xl font-black uppercase text-emerald-400">JACKPOT!</h2>
                    <p className="text-xl font-bold">You banked <span className="text-primary">{Math.floor(betAmount * multiplier).toLocaleString()} PTS</span></p>
                  </div>
               </div>
            )}

            {status === "LOST" && (
               <div className="absolute inset-x-0 inset-y-0 z-50 flex items-center justify-center bg-red-500/10 backdrop-blur-sm rounded-3xl animate-in zoom-in duration-300 pointer-events-none">
                  <div className="text-center bg-slate-950 p-10 rounded-3xl border border-red-500/30 space-y-4 shadow-3xl">
                    <Bomb size={64} className="text-red-500 mx-auto animate-bounce" />
                    <h2 className="text-4xl font-black uppercase text-red-500 tracking-tighter">ELIMINATED</h2>
                    <p className="text-on-surface-variant font-medium">Better luck in the next deployment.</p>
                  </div>
               </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { icon: <Info size={16} />, label: 'House Edge', val: '3.0%' },
               { icon: <History size={16} />, label: 'Fairness', val: 'Provable' },
               { icon: <RotateCw size={16} />, label: 'Avg RTP', val: '97.0%' },
               { icon: <ShieldCheck size={16} />, label: 'Status', val: 'Verified' }
             ].map((item, idx) => (
               <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col items-center">
                 <div className="text-on-surface-variant mb-2 opacity-40">{item.icon}</div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">{item.label}</p>
                 <p className="text-xs font-black text-on-surface mt-1">{item.val}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
