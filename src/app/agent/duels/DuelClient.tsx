"use client";

import React, { useState, useEffect } from "react";
import { 
  Swords, 
  Users, 
  ChevronRight, 
  RotateCw, 
  Trophy, 
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { joinMatchmaking, getActiveDuel, playDuelTurn } from "@/app/actions/duels";

export function DuelClient({ userId }: { userId: string }) {
  const [game, setGame] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [stake, setStake] = useState(500);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Polling for game updates
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkGame = async () => {
      const activeGame = await getActiveDuel();
      if (activeGame) {
        setGame(activeGame);
        setIsSearching(false);
      } else if (!isSearching) {
        setGame(null);
      }
    };

    if (isSearching || game?.status === "PLAYING") {
      interval = setInterval(checkGame, 2000);
    }

    return () => clearInterval(interval);
  }, [isSearching, game?.status]);

  const handleJoin = async () => {
    setError(null);
    setIsPending(true);
    const res = await joinMatchmaking(stake);
    if (res.success) {
      if (res.matched) {
        // Direct match
        const activeGame = await getActiveDuel();
        setGame(activeGame);
      } else {
        setIsSearching(true);
      }
    } else {
      setError(res.error || "Failed to join");
    }
    setIsPending(false);
  };

  const handlePlayTurn = async (guess: "HIGHER" | "LOWER") => {
    if (!game || game.turn !== userId || isPending) return;
    setIsPending(true);
    const res = await playDuelTurn(game.gameId, guess);
    if (res.success) {
      setGame(res.game);
    } else {
      setError(res.error || "Move failed");
    }
    setIsPending(false);
  };

  const getCardLabel = (val: number) => {
    if (val === 1) return "A";
    if (val === 11) return "J";
    if (val === 12) return "Q";
    if (val === 13) return "K";
    return val.toString();
  };

  return (
    <div className="animate-vapor pt-4">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest border border-secondary/20">
            <Swords size={12} /> Competitive Arena
          </div>
          <h2 className="text-5xl font-black font-headline tracking-tighter uppercase whitespace-nowrap">Kinetic <span className="text-secondary text-6xl">Duels</span></h2>
          <p className="text-on-surface-variant text-sm font-medium opacity-60">High-stakes 1v1 card battles. Predict higher or lower to dominate.</p>
        </div>

        {!game && !isSearching && (
          <div className="flex justify-center">
            <GlassCard className="p-10 w-full max-w-md bg-surface-container-low/40 border-secondary/20 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] block ml-1">Select Stake</label>
                <div className="grid grid-cols-3 gap-3">
                  {[500, 1000, 5000].map(val => (
                    <button 
                      key={val}
                      onClick={() => setStake(val)}
                      className={cn(
                        "py-3 rounded-xl font-black text-sm border-2 transition-all",
                        stake === val ? "bg-secondary text-background border-secondary" : "bg-white/5 border-white/5 hover:border-secondary/40"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleJoin}
                disabled={isPending}
                className="w-full bg-secondary text-background py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:shadow-[0_0_40px_rgba(110,155,255,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {isPending ? "INITIALIZING..." : "FIND 1V1 MATCH"}
              </button>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {isSearching && (
          <div className="flex justify-center flex-col items-center space-y-8 py-20">
             <div className="relative">
                <div className="absolute inset-0 bg-secondary/20 blur-[60px] animate-pulse"></div>
                <Users size={80} className="text-secondary animate-bounce" />
             </div>
             <div className="text-center space-y-2">
                <p className="text-xl font-black uppercase tracking-tighter">Scanning for Opponents...</p>
                <p className="text-xs font-medium text-on-surface-variant opacity-60">Stake: {stake} Kinetic Points</p>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-secondary uppercase tracking-[0.4em] animate-pulse">
                <Clock size={12} /> Pairing nodes
             </div>
          </div>
        )}

        {game && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8">
               <GlassCard className="p-10 bg-slate-950/60 border-secondary/20 min-h-[400px] relative flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Swords size={120} className="text-secondary" />
                  </div>

                  {/* The Current Card */}
                  <div className="space-y-6 text-center z-10">
                     <div className="relative group">
                        <div className="absolute inset-0 bg-secondary/20 blur-[40px] group-hover:bg-secondary/40 transition-all"></div>
                        <div className="w-40 h-56 rounded-3xl bg-white flex items-center justify-center text-7xl font-black text-slate-950 shadow-2xl border-8 border-slate-200 transform-gpu transition-all">
                           {getCardLabel(game.currentCard)}
                        </div>
                     </div>
                     <p className="text-[10px] font-black text-secondary uppercase tracking-[0.5em] animate-pulse">Active Card</p>
                  </div>

                  {/* Controls */}
                  <div className="mt-12 w-full flex gap-4 z-10">
                    <button 
                      onClick={() => handlePlayTurn("HIGHER")}
                      disabled={game.turn !== userId || game.status !== "PLAYING" || isPending}
                      className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 py-5 rounded-2xl flex flex-col items-center gap-2 transition-all group disabled:opacity-30"
                    >
                      <ArrowUp className="text-emerald-400 group-hover:-translate-y-1 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Predict Higher</span>
                    </button>
                    <button 
                      onClick={() => handlePlayTurn("LOWER")}
                      disabled={game.turn !== userId || game.status !== "PLAYING" || isPending}
                      className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 py-5 rounded-2xl flex flex-col items-center gap-2 transition-all group disabled:opacity-30"
                    >
                      <ArrowDown className="text-red-400 group-hover:translate-y-1 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Predict Lower</span>
                    </button>
                  </div>
                 
                  {game.turn === userId && game.status === "PLAYING" && (
                    <div className="mt-6 text-emerald-400 font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                       <ShieldCheck size={14} /> Your Deployment Turn
                    </div>
                  )}
               </GlassCard>
            </div>

            <div className="md:col-span-4 space-y-6">
               <GlassCard className="p-6 bg-surface-container-high/40 border-white/10">
                  <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-6">Score Matrix</h3>
                  <div className="space-y-4">
                     {game.players.map((pid: string, idx: number) => (
                       <div key={pid} className={cn(
                        "p-4 rounded-xl flex items-center justify-between border",
                        pid === userId ? "bg-secondary/5 border-secondary/30" : "bg-white/5 border-white/5"
                       )}>
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black">
                                {idx + 1}
                             </div>
                             <span className="text-xs font-bold uppercase tracking-tight">{pid === userId ? "You" : "Opponent"}</span>
                          </div>
                          <span className="text-xl font-black font-mono">{game.scores[pid]}</span>
                       </div>
                     ))}
                  </div>
               </GlassCard>

               <GlassCard className="p-6 bg-surface-container-high/40 border-white/10">
                  <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">Duel Intel</h3>
                  <div className="space-y-3">
                     <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant font-medium">Pot Size</span>
                        <span className="text-emerald-400 font-black">{Math.floor(game.stake * 1.9)} PTS</span>
                     </div>
                     <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant font-medium">Card Variance</span>
                        <span className="text-white font-bold">1 - 13</span>
                     </div>
                     <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant font-medium">Turn Time</span>
                        <span className="text-white font-bold opacity-50">∞</span>
                     </div>
                  </div>
               </GlassCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
