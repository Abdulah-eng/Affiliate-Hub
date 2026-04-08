"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Swords, 
  Users, 
  RotateCw, 
  Trophy, 
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  Skull,
  Sparkles,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { joinMatchmaking, getActiveDuel, playDuelTurn, leaveMatchmaking } from "@/app/actions/duels";

export function DuelClient({ userId }: { userId: string }) {
  const [game, setGame] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [stake, setStake] = useState(500);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardFlip, setCardFlip] = useState(false);
  const [lastGuess, setLastGuess] = useState<"HIGHER" | "LOWER" | null>(null);
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);

  // Polling for game updates
  const checkGame = useCallback(async () => {
    const activeGame = await getActiveDuel();
    if (activeGame) {
      setGame((prev: any) => {
        // Trigger card flip animation if card changed
        if (prev && prev.currentCard !== activeGame.currentCard) {
          setCardFlip(true);
          setTimeout(() => setCardFlip(false), 600);
        }
        return activeGame;
      });
      if (isSearching) setIsSearching(false);
    } else if (!isSearching) {
      // Game expired/ended from Redis
    }
  }, [isSearching]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching || (game?.status === "PLAYING" && game?.turn !== userId)) {
      interval = setInterval(checkGame, 2000);
    }
    return () => clearInterval(interval);
  }, [isSearching, game?.status, game?.turn, userId, checkGame]);

  const handleJoin = async () => {
    setError(null);
    setIsPending(true);
    setLastGuess(null);
    setLastResult(null);
    const res = await joinMatchmaking(stake);
    if (res.success) {
      if (res.matched) {
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
    if (!game || game.turn !== userId || isPending || game.status !== "PLAYING") return;
    setIsPending(true);
    setLastGuess(guess);
    const res = await playDuelTurn(game.gameId, guess);
    if (res.success) {
      // Determine if the guess was correct by checking score
      const oldScore = game.scores[userId] || 0;
      const newScore = res.game?.scores?.[userId] || 0;
      setLastResult(newScore > oldScore ? "correct" : "wrong");
      setCardFlip(true);
      setTimeout(() => setCardFlip(false), 600);
      setGame(res.game);
    } else {
      setError(res.error || "Move failed");
    }
    setIsPending(false);
  };

  const handleReset = async () => {
    setGame(null);
    setIsSearching(false);
    setError(null);
    setLastGuess(null);
    setLastResult(null);
  };

  const handleCancelSearch = async () => {
    setIsPending(true);
    await leaveMatchmaking();
    setIsSearching(false);
    setIsPending(false);
  };

  const getCardLabel = (val: number) => {
    if (val === 1) return "A";
    if (val === 11) return "J";
    if (val === 12) return "Q";
    if (val === 13) return "K";
    return val.toString();
  };

  const isMyTurn = game?.turn === userId;
  const isFinished = game?.status === "FINISHED";
  const myScore = game?.scores?.[userId] || 0;
  const oppId = game?.players?.find((p: string) => p !== userId);
  const oppScore = game?.scores?.[oppId] || 0;
  const iWon = isFinished && myScore > oppScore;
  const isDrawn = isFinished && myScore === oppScore;

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

        {/* IDLE: Matchmaking */}
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
                        stake === val ? "bg-secondary text-background border-secondary shadow-[0_0_20px_rgba(110,155,255,0.3)]" : "bg-white/5 border-white/5 hover:border-secondary/40"
                      )}
                    >
                      {val.toLocaleString()}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant opacity-50 text-center">Each player stakes <span className="text-secondary font-black">{stake.toLocaleString()} PTS</span>. Winner takes <span className="text-emerald-400 font-black">{Math.floor(stake * 1.9).toLocaleString()} PTS</span>.</p>
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

        {/* SEARCHING */}
        {isSearching && (
          <div className="flex justify-center flex-col items-center space-y-8 py-20">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary/20 blur-[60px] animate-pulse"></div>
              <Users size={80} className="text-secondary animate-bounce" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-black uppercase tracking-tighter">Scanning for Opponents...</p>
              <p className="text-xs font-medium text-on-surface-variant opacity-60">Stake: {stake.toLocaleString()} Kinetic Points</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-secondary uppercase tracking-[0.4em] animate-pulse">
              <Clock size={12} /> Pairing nodes
            </div>
            <button
              onClick={handleCancelSearch}
              disabled={isPending}
              className="px-8 py-3 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest transition-all"
            >
              Cancel Search
            </button>
          </div>
        )}

        {/* GAME: Active / Finished */}
        {game && (
          <div className="relative">
            {/* Win/Loss/Draw Overlay */}
            {isFinished && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md rounded-3xl animate-in fade-in duration-500">
                <div className="text-center p-12 space-y-6">
                  {iWon ? (
                    <>
                      <div className="relative mx-auto w-28 h-28">
                        <div className="absolute inset-0 bg-secondary/30 blur-[40px] animate-pulse rounded-full"></div>
                        <div className="w-28 h-28 rounded-full bg-secondary/20 border-2 border-secondary flex items-center justify-center">
                          <Trophy size={56} className="text-secondary fill-current" />
                        </div>
                      </div>
                      <h2 className="text-5xl font-black uppercase text-secondary tracking-tighter">VICTORIOUS!</h2>
                      <p className="text-on-surface-variant">You claimed <span className="text-emerald-400 font-black text-xl">{Math.floor(stake * 1.9).toLocaleString()} PTS</span></p>
                    </>
                  ) : isDrawn ? (
                    <>
                      <div className="w-28 h-28 rounded-full bg-primary/20 border-2 border-primary mx-auto flex items-center justify-center">
                        <Sparkles size={56} className="text-primary" />
                      </div>
                      <h2 className="text-5xl font-black uppercase text-primary tracking-tighter">DRAW!</h2>
                      <p className="text-on-surface-variant">Stakes returned to both players.</p>
                    </>
                  ) : (
                    <>
                      <div className="w-28 h-28 rounded-full bg-red-500/20 border-2 border-red-500 mx-auto flex items-center justify-center">
                        <Skull size={56} className="text-red-500" />
                      </div>
                      <h2 className="text-5xl font-black uppercase text-red-500 tracking-tighter">DEFEATED</h2>
                      <p className="text-on-surface-variant opacity-70">Better luck next deployment.</p>
                    </>
                  )}
                  <div className="flex gap-4 justify-center pt-4">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-secondary text-background font-black uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(110,155,255,0.4)] transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <RotateCw size={16} /> REMATCH
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Main Card Area */}
              <div className="md:col-span-8">
                <GlassCard className="p-10 bg-slate-950/60 border-secondary/20 min-h-[400px] relative flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Swords size={120} className="text-secondary" />
                  </div>

                  {/* Turn indicator badge */}
                  <div className={cn(
                    "absolute top-4 left-4 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                    isMyTurn && !isFinished
                      ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.2)]"
                      : "bg-white/5 text-on-surface-variant border border-white/10"
                  )}>
                    {isMyTurn && !isFinished ? <><ShieldCheck size={12} /> Your Turn</> : <><Clock size={12} /> Waiting...</>}
                  </div>

                  {/* Last guess result flash */}
                  {lastResult && (
                    <div className={cn(
                      "absolute top-4 right-4 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      lastResult === "correct" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                    )}>
                      {lastResult === "correct" ? "✓ Correct!" : "✗ Wrong!"}
                    </div>
                  )}

                  {/* The Current Card */}
                  <div className="space-y-6 text-center z-10">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-secondary/20 blur-[40px] group-hover:bg-secondary/40 transition-all"></div>
                      <div className={cn(
                        "w-40 h-56 rounded-3xl bg-white flex items-center justify-center text-7xl font-black text-slate-950 shadow-2xl border-8 border-slate-200 transform-gpu transition-all duration-300",
                        cardFlip && "scale-95 opacity-70"
                      )}>
                        {getCardLabel(game.currentCard)}
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.5em] animate-pulse">Active Card</p>
                  </div>

                  {/* Controls */}
                  <div className="mt-12 w-full flex gap-4 z-10">
                    <button 
                      onClick={() => handlePlayTurn("HIGHER")}
                      disabled={!isMyTurn || isFinished || isPending}
                      className="flex-1 bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 py-5 rounded-2xl flex flex-col items-center gap-2 transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="text-emerald-400 group-hover:-translate-y-1 transition-transform" size={28} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Higher</span>
                    </button>
                    <button 
                      onClick={() => handlePlayTurn("LOWER")}
                      disabled={!isMyTurn || isFinished || isPending}
                      className="flex-1 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 py-5 rounded-2xl flex flex-col items-center gap-2 transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="text-red-400 group-hover:translate-y-1 transition-transform" size={28} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Lower</span>
                    </button>
                  </div>

                  {isPending && (
                    <div className="mt-6 flex items-center gap-2 text-secondary text-[10px] font-black uppercase tracking-widest animate-pulse">
                      <Zap size={12} /> Processing move...
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest">
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}
                </GlassCard>
              </div>

              {/* Sidebar: Score + Intel */}
              <div className="md:col-span-4 space-y-6">
                <GlassCard className="p-6 bg-surface-container-high/40 border-white/10">
                  <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-6">Score Matrix</h3>
                  <div className="space-y-4">
                    {game.players.map((pid: string, idx: number) => (
                      <div key={pid} className={cn(
                        "p-4 rounded-xl flex items-center justify-between border transition-all",
                        pid === userId ? "bg-secondary/5 border-secondary/30" : "bg-white/5 border-white/5"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black",
                            pid === userId ? "bg-secondary/20 text-secondary" : "bg-slate-900 text-on-surface-variant"
                          )}>
                            {idx + 1}
                          </div>
                          <span className="text-xs font-bold uppercase tracking-tight">{pid === userId ? "You" : "Opponent"}</span>
                        </div>
                        <span className="text-2xl font-black font-mono">{game.scores[pid]}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-6 bg-surface-container-high/40 border-white/10">
                  <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">Duel Intel</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant font-medium">Pot Size</span>
                      <span className="text-emerald-400 font-black">{Math.floor(game.stake * 1.9).toLocaleString()} PTS</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant font-medium">Card Variance</span>
                      <span className="text-white font-bold">A → K (1–13)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant font-medium">Status</span>
                      <span className={cn("font-bold uppercase text-[10px] tracking-widest", isFinished ? "text-tertiary" : "text-emerald-400 animate-pulse")}>
                        {isFinished ? "Finished" : isMyTurn ? "Your Turn" : "Opponent's Turn"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant font-medium">Moves</span>
                      <span className="text-white font-bold">{game.history?.length || 0} / 6</span>
                    </div>
                  </div>
                </GlassCard>

                {/* Quit button for active game */}
                {!isFinished && (
                  <button
                    onClick={handleReset}
                    className="w-full py-3 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Forfeit Duel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
