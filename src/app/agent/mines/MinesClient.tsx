"use client";

import React, { useState } from "react";
import { 
  Bomb, 
  Gem, 
  Coins, 
  ShieldCheck, 
  RotateCw, 
  AlertTriangle,
  Trophy,
  History,
  Info,
  Zap,
  Skull
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { startMinesGame, revealMinesTile, cashOutMines } from "@/app/actions/mines";

export function MinesClient({ userPoints: initialPoints }: { userPoints: number }) {
  const [betAmount, setBetAmount] = useState(100);
  const [mineCount, setMineCount] = useState(3);
  const [status, setStatus] = useState<"IDLE" | "PLAYING" | "WON" | "LOST">("IDLE");
  const [revealed, setRevealed] = useState<number[]>([]);
  const [board, setBoard] = useState<(boolean | null)[]>(new Array(25).fill(null));
  const [multiplier, setMultiplier] = useState(1.0);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [userPoints, setUserPoints] = useState(initialPoints);

  const handleStart = async () => {
    if (userPoints < betAmount) {
      setError("Insufficient points");
      return;
    }
    setIsPending(true);
    setError(null);
    setLastWin(null);
    
    const res = await startMinesGame(betAmount, mineCount);
    if (res.success) {
      setStatus("PLAYING");
      setRevealed([]);
      setBoard(new Array(25).fill(null));
      setMultiplier(1.0);
      setUserPoints(prev => prev - betAmount);
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
        const newBoard = res.board!.map((isMine: boolean) => isMine);
        setBoard(newBoard);
      } else {
        setRevealed(res.revealed!);
        setMultiplier(res.multiplier!);
        const newBoard = [...board];
        newBoard[idx] = false; // Gem
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
      setLastWin(res.winAmount || 0);
      setUserPoints(prev => prev + (res.winAmount || 0));
    } else {
      setError(res.error || "Cash out failed");
    }
    setIsPending(false);
  };

  const isGameOver = status === "WON" || status === "LOST";

  return (
    <div className="animate-vapor pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Settings Panel */}
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
          <GlassCard className="p-4 sm:p-8 space-y-8 border-primary/20 bg-surface-container-low/40 h-full">
            <div>
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <ShieldCheck size={16} /> Strategy Config
              </h3>
              
              <div className={cn("space-y-6 transition-opacity", status === "PLAYING" && "opacity-50 pointer-events-none")}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    <span>Bet Amount</span>
                    <span className="text-primary">{betAmount.toLocaleString()} PTS</span>
                  </div>
                  <div className="relative group">
                    <input 
                      type="number" 
                      value={betAmount} 
                      onChange={e => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-950/60 border border-white/10 px-6 py-4 rounded-2xl text-lg font-black text-on-surface focus:border-primary/40 focus:ring-1 ring-primary/20 transition-all outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                      <button onClick={() => setBetAmount(Math.max(1, Math.floor(betAmount/2)))} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-tighter">½</button>
                      <button onClick={() => setBetAmount(betAmount*2)} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-tighter">2×</button>
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
              {status === "PLAYING" ? (
                <button 
                  onClick={handleCashOut}
                  disabled={isPending || revealed.length === 0}
                  className="w-full bg-emerald-500 text-background py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'SYNCHING...' : `CASH OUT (${multiplier.toFixed(2)}x = ${Math.floor(betAmount * multiplier).toLocaleString()} PTS)`}
                </button>
              ) : (
                <button 
                  onClick={handleStart}
                  disabled={isPending}
                  className="w-full bg-primary text-background py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:shadow-[0_0_40px_rgba(129,236,255,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isPending ? (
                    <><RotateCw size={16} className="animate-spin" /> DEPLOYING...</>
                  ) : isGameOver ? (
                    <><RotateCw size={16} /> PLAY AGAIN</>
                  ) : (
                    <><Zap size={16} /> START GAME</>
                  )}
                </button>
              )}
              
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
                  <AlertTriangle size={16} />
                  <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
              )}
            </div>
            
            <div className="pt-6 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03]">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Coins size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Your Balance</p>
                  <p className="text-sm font-black text-on-surface">{userPoints.toLocaleString()} PTS</p>
                </div>
              </div>

              {status === "PLAYING" && (
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Current Multiplier</p>
                  <p className="text-2xl font-black text-emerald-400">{multiplier.toFixed(2)}×</p>
                  <p className="text-[9px] text-on-surface-variant mt-1">{revealed.length} gems found</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Game Canvas */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="relative">
            {/* Header / Stats */}
            <div className="mb-8 flex justify-between items-end px-4">
              <div>
                <h2 className="text-4xl font-black font-headline tracking-tighter uppercase leading-none">Kinetic <span className="text-secondary text-5xl">Mines</span></h2>
                <p className="text-on-surface-variant text-sm font-medium mt-1 opacity-70">Gems & Bombs Arena — {mineCount} mine{mineCount > 1 ? "s" : ""} hidden</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Multiplier</p>
                <p className={cn("text-3xl font-black transition-all duration-300", multiplier > 1 ? "text-emerald-400" : "text-on-surface")}>{multiplier.toFixed(2)}×</p>
              </div>
            </div>

            {/* 5x5 Grid */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-[600px] w-full mx-auto px-2">
              {new Array(25).fill(null).map((_, i) => {
                const isRevealed = revealed.includes(i);
                const isMine = board[i] === true;
                const isGem = board[i] === false;
                const isClickable = status === "PLAYING" && !isRevealed && !isPending;

                return (
                  <button
                    key={i}
                    onClick={() => handleTileClick(i)}
                    disabled={!isClickable}
                    className={cn(
                      "aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 relative select-none",
                      // Idle tiles (not yet revealed during play)
                      !isRevealed && status === "PLAYING" && "bg-surface-container-high border-2 border-white/5 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] hover:-translate-y-1 cursor-pointer active:scale-90",
                      // Not started / game over, unreveled
                      !isRevealed && status !== "PLAYING" && "bg-surface-container/40 border border-white/5",
                      // Gem
                      isGem && "bg-emerald-500/20 border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(52,211,153,0.15)]",
                      // Mine
                      isMine && "bg-red-500/20 border-2 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse",
                    )}
                  >
                    <div className={cn("transition-all duration-500", isRevealed ? "opacity-100 scale-100" : "opacity-0 scale-50")}>
                      {isMine && <Bomb size={22} className="text-red-400 fill-current" />}
                      {isGem && <Gem size={26} className="text-emerald-400 fill-current drop-shadow-[0_0_8px_#10b981]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* WIN Overlay */}
            {status === "WON" && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md rounded-3xl animate-in fade-in duration-500">
                <div className="text-center p-10 space-y-5">
                  <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-emerald-500/30 blur-[40px] animate-pulse rounded-full"></div>
                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full border-2 border-emerald-500 mx-auto flex items-center justify-center">
                      <Trophy size={48} className="text-emerald-400" />
                    </div>
                  </div>
                  <h2 className="text-4xl font-black uppercase text-emerald-400 tracking-tighter">JACKPOT!</h2>
                  <p className="text-lg font-bold text-on-surface">
                    You banked <span className="text-primary font-black">{lastWin?.toLocaleString()} PTS</span>
                  </p>
                  <p className="text-sm text-on-surface-variant opacity-60">{multiplier.toFixed(2)}× multiplier · {revealed.length} gems found</p>
                </div>
              </div>
            )}

            {/* LOST Overlay */}
            {status === "LOST" && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-950/40 backdrop-blur-sm rounded-3xl animate-in zoom-in duration-300">
                <div className="text-center bg-slate-950 p-10 rounded-3xl border border-red-500/30 space-y-4 shadow-2xl">
                  <Skull size={64} className="text-red-500 mx-auto" />
                  <h2 className="text-4xl font-black uppercase text-red-500 tracking-tighter">ELIMINATED</h2>
                  <p className="text-on-surface-variant font-medium text-sm">You hit a bomb. <span className="text-red-400 font-black">{betAmount.toLocaleString()} PTS</span> lost.</p>
                  <p className="text-[10px] text-on-surface-variant opacity-50">Click "Play Again" to redeploy.</p>
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
