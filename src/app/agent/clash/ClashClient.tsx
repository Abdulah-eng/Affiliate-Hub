"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Target,
  Users,
  Clock,
  Trophy,
  Skull,
  Sparkles,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  joinClashQueue,
  getActiveClash,
  submitClashPick,
  leaveClashQueue,
} from "@/app/actions/clash";

type GameStatus = "IDLE" | "SEARCHING" | "PLAYING" | "RESOLVED";

export function ClashClient({ userId }: { userId: string }) {
  const [phase, setPhase] = useState<GameStatus>("IDLE");
  const [game, setGame] = useState<any>(null);
  const [stake, setStake] = useState(500);
  const [myPick, setMyPick] = useState<number | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roundFlash, setRoundFlash] = useState<"correct" | "wrong" | "tie" | null>(null);

  // Poll for game state when searching or in-game waiting
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  const refreshGame = useCallback(async () => {
    const g = await getActiveClash();
    if (g) {
      setGame((prev: any) => {
        // Detect round resolved: lastTarget changed and picks cleared
        if (prev && prev.round !== g.round && g.lastTarget !== null) {
          const wasWinner = g.lastRoundWinner === userId;
          const wasTie = g.lastRoundWinner === null;
          setRoundFlash(wasTie ? "tie" : wasWinner ? "correct" : "wrong");
          setTimeout(() => setRoundFlash(null), 2500);
          setMyPick(null);
        }
        return g;
      });
      if (phase === "SEARCHING") setPhase("PLAYING");
      if (g.status === "FINISHED") stopPolling();
    }
  }, [phase, userId]);

  useEffect(() => {
    if (phase === "SEARCHING" || (phase === "PLAYING" && game?.status === "PLAYING")) {
      pollRef.current = setInterval(refreshGame, 2000);
    } else {
      stopPolling();
    }
    return stopPolling;
  }, [phase, game?.status, refreshGame]);

  const handleJoin = async () => {
    setError(null);
    setIsPending(true);
    const res = await joinClashQueue(stake);
    if (res.success) {
      if (res.matched) {
        const g = await getActiveClash();
        setGame(g);
        setPhase("PLAYING");
      } else {
        setPhase("SEARCHING");
      }
    } else {
      setError(res.error ?? "Failed to join");
    }
    setIsPending(false);
  };

  const handlePick = async (n: number) => {
    if (!game || game.picks?.[userId] !== null || isPending || game.status !== "PLAYING") return;
    setMyPick(n);
    setIsPending(true);
    const res = await submitClashPick(n);
    if (res.success) {
      setGame(res.game);
      // If opponent had already picked, round resolves immediately
      if (res.game.round !== game.round) {
        const wasWinner = res.game.lastRoundWinner === userId;
        const wasTie = res.game.lastRoundWinner === null;
        setRoundFlash(wasTie ? "tie" : wasWinner ? "correct" : "wrong");
        setTimeout(() => setRoundFlash(null), 2500);
        setMyPick(null);
      }
    } else {
      setError(res.error ?? "Pick failed");
      setMyPick(null);
    }
    setIsPending(false);
  };

  const handleReset = () => {
    setGame(null);
    setPhase("IDLE");
    setMyPick(null);
    setError(null);
    setRoundFlash(null);
    stopPolling();
  };

  const handleCancelSearch = async () => {
    setIsPending(true);
    await leaveClashQueue();
    setPhase("IDLE");
    setIsPending(false);
  };

  const isFinished = game?.status === "FINISHED";
  const myScore = game?.scores?.[userId] ?? 0;
  const oppId = game?.players?.find((p: string) => p !== userId);
  const oppScore = game?.scores?.[oppId] ?? 0;
  const iWon = isFinished && myScore > oppScore;
  const isDrawn = isFinished && myScore === oppScore;

  const iHavePicked = game?.picks?.[userId] !== null && game?.picks?.[userId] !== undefined;
  const oppHasPicked = game?.picks?.[oppId] === "HIDDEN";

  return (
    <div className="animate-vapor pt-4 max-w-4xl mx-auto space-y-10">

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
          <Target size={12} /> 1v1 Number War
        </div>
        <h2 className="text-5xl font-black font-headline tracking-tighter uppercase">
          Kinetic <span className="text-amber-400 text-6xl">Clash</span>
        </h2>
        <p className="text-on-surface-variant text-sm font-medium opacity-60">
          Both players pick 1–10 simultaneously. Closest to the secret target wins each round. Best of 5 takes the pot.
        </p>
      </div>

      {/* ── IDLE ─────────────────────────────────────────────────────────── */}
      {phase === "IDLE" && (
        <div className="flex justify-center">
          <GlassCard className="p-10 w-full max-w-md bg-surface-container-low/40 border-amber-500/20 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] block">Select Stake</label>
              <div className="grid grid-cols-3 gap-3">
                {[500, 1000, 5000].map(val => (
                  <button
                    key={val}
                    onClick={() => setStake(val)}
                    className={cn(
                      "py-3 rounded-xl font-black text-sm border-2 transition-all",
                      stake === val
                        ? "bg-amber-500 text-background border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                        : "bg-white/5 border-white/5 hover:border-amber-500/40"
                    )}
                  >
                    {val.toLocaleString()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant opacity-50 text-center">
                Each player stakes <span className="text-amber-400 font-black">{stake.toLocaleString()} PTS</span>. Winner takes{" "}
                <span className="text-emerald-400 font-black">{Math.floor(stake * 1.9).toLocaleString()} PTS</span>.
              </p>
            </div>
            <button
              onClick={handleJoin}
              disabled={isPending}
              className="w-full bg-amber-500 text-background py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isPending ? "INITIALIZING..." : "FIND OPPONENT"}
            </button>
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-[10px] font-black uppercase tracking-widest">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* ── SEARCHING ────────────────────────────────────────────────────── */}
      {phase === "SEARCHING" && (
        <div className="flex flex-col items-center gap-8 py-20">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/20 blur-[60px] animate-pulse rounded-full" />
            <Users size={80} className="text-amber-400 animate-bounce relative z-10" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-black uppercase tracking-tighter">Scanning for opponents…</p>
            <p className="text-xs text-on-surface-variant opacity-60">Stake: {stake.toLocaleString()} PTS</p>
          </div>
          <div className="flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
            <Clock size={12} /> Pairing nodes
          </div>
          <button
            onClick={handleCancelSearch}
            disabled={isPending}
            className="px-8 py-3 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── GAME ─────────────────────────────────────────────────────────── */}
      {(phase === "PLAYING" || (phase === "IDLE" && game)) && game && (
        <div className="relative">

          {/* Win / Loss / Draw overlay */}
          {isFinished && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-xl rounded-3xl animate-in fade-in duration-500">
              <div className="text-center p-12 space-y-6">
                {iWon ? (
                  <>
                    <div className="relative mx-auto w-28 h-28">
                      <div className="absolute inset-0 bg-amber-500/30 blur-[50px] rounded-full animate-pulse" />
                      <div className="w-28 h-28 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
                        <Trophy size={56} className="text-amber-400 fill-current" />
                      </div>
                    </div>
                    <h2 className="text-5xl font-black uppercase text-amber-400 tracking-tighter">VICTORIOUS!</h2>
                    <p className="text-on-surface-variant">
                      You claimed <span className="text-emerald-400 font-black text-xl">{Math.floor(stake * 1.9).toLocaleString()} PTS</span>
                    </p>
                    <p className="text-xs text-on-surface-variant opacity-50">{myScore} — {oppScore} rounds</p>
                  </>
                ) : isDrawn ? (
                  <>
                    <div className="w-28 h-28 rounded-full bg-primary/20 border-2 border-primary mx-auto flex items-center justify-center">
                      <Sparkles size={56} className="text-primary" />
                    </div>
                    <h2 className="text-5xl font-black uppercase text-primary tracking-tighter">DRAW!</h2>
                    <p className="text-on-surface-variant opacity-70">Stakes returned.</p>
                  </>
                ) : (
                  <>
                    <div className="w-28 h-28 rounded-full bg-red-500/20 border-2 border-red-500 mx-auto flex items-center justify-center">
                      <Skull size={56} className="text-red-500" />
                    </div>
                    <h2 className="text-5xl font-black uppercase text-red-500 tracking-tighter">DEFEATED</h2>
                    <p className="text-on-surface-variant opacity-60">{myScore} — {oppScore} rounds</p>
                  </>
                )}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-amber-500 text-background font-black uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.02] mx-auto"
                >
                  <RotateCw size={16} /> REMATCH
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

            {/* Main Pick Area */}
            <div className="md:col-span-8">
              <GlassCard className="p-8 bg-slate-950/60 border-amber-500/20 min-h-[420px] flex flex-col relative overflow-hidden">
                {/* BG decoration */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Target size={120} className="text-amber-400" />
                </div>

                {/* Round header */}
                <div className="flex items-center justify-between mb-6 z-10 relative">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">
                    Round {Math.min(game.round, game.maxRounds)} / {game.maxRounds}
                  </span>
                  <div className="flex gap-1.5">
                    {Array.from({ length: game.maxRounds }).map((_, i) => {
                      const hist = game.history?.[i];
                      return (
                        <div
                          key={i}
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center border text-[9px] font-black transition-all",
                            !hist ? "bg-white/5 border-white/10 text-on-surface-variant" :
                            hist.winner === userId ? "bg-amber-500/20 border-amber-500/60 text-amber-400" :
                            hist.winner === null ? "bg-white/10 border-white/20 text-white/50" :
                            "bg-red-500/20 border-red-500/40 text-red-400"
                          )}
                        >
                          {i + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Round flash result */}
                {roundFlash && (
                  <div className={cn(
                    "mb-4 px-4 py-3 rounded-xl flex items-center gap-3 text-[11px] font-black uppercase tracking-widest border animate-in fade-in zoom-in-90 duration-300",
                    roundFlash === "correct" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                    roundFlash === "tie" ? "bg-primary/10 border-primary/30 text-primary" :
                    "bg-red-500/10 border-red-500/30 text-red-400"
                  )}>
                    {roundFlash === "correct" ? <><CheckCircle2 size={16} /> You won that round! +1 point</> :
                     roundFlash === "tie" ? <><Sparkles size={16} /> Exact tie — no point awarded</> :
                     <><XCircle size={16} /> Opponent was closer</>}
                  </div>
                )}

                {/* Last round reveal */}
                {game.lastTarget !== null && game.picks?.[userId] === null && !roundFlash && game.lastPicks && (
                  <div className="mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-on-surface-variant space-y-1">
                    <p className="font-black uppercase tracking-widest text-[9px] text-on-surface-variant opacity-50">Last Round</p>
                    <div className="flex gap-6">
                      <span>Your pick: <span className="text-amber-400 font-black">{game.lastPicks[userId]}</span></span>
                      <span>Opponent: <span className="text-secondary font-black">{game.lastPicks[oppId]}</span></span>
                      <span>Target: <span className="text-emerald-400 font-black">{game.lastTarget}</span></span>
                    </div>
                  </div>
                )}

                {/* Status badge */}
                <div className="flex gap-4 mb-6 z-10 relative">
                  <div className={cn(
                    "flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest",
                    iHavePicked ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-white/5 border-white/5 text-on-surface-variant"
                  )}>
                    {iHavePicked ? <><CheckCircle2 size={14} /> Picked: {myPick ?? game.picks?.[userId]}</> : <><Hash size={14} /> Pick a Number</>}
                  </div>
                  <div className={cn(
                    "flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest",
                    oppHasPicked ? "bg-secondary/10 border-secondary/30 text-secondary" : "bg-white/5 border-white/5 text-on-surface-variant"
                  )}>
                    <Clock size={14} /> {oppHasPicked ? "Opponent Picked ✓" : "Waiting for opponent…"}
                  </div>
                </div>

                {/* Number Grid */}
                <div className="grid grid-cols-5 gap-3 flex-1 z-10 relative">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
                    const isMyChoice = (myPick ?? game.picks?.[userId]) === n;
                    const disabled = iHavePicked || isFinished || isPending || game.status !== "PLAYING";
                    return (
                      <button
                        key={n}
                        onClick={() => handlePick(n)}
                        disabled={disabled}
                        className={cn(
                          "aspect-square rounded-2xl flex items-center justify-center text-2xl font-black transition-all duration-200 border-2",
                          isMyChoice
                            ? "bg-amber-500 text-background border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.4)] scale-110"
                            : !disabled
                              ? "bg-surface-container-high border-white/5 hover:bg-amber-500/20 hover:border-amber-500/50 hover:-translate-y-1 cursor-pointer active:scale-90"
                              : "bg-surface-container/40 border-white/5 opacity-30 cursor-not-allowed"
                        )}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>

                {isPending && (
                  <div className="mt-4 flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-widest animate-pulse z-10">
                    <Zap size={12} /> Processing…
                  </div>
                )}
                {error && (
                  <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-[10px] font-black z-10">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Sidebar: Score + History */}
            <div className="md:col-span-4 space-y-5">
              <GlassCard className="p-6 border-amber-500/20 bg-surface-container-high/40">
                <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-5">Score</h3>
                <div className="space-y-3">
                  {game.players.map((pid: string, idx: number) => (
                    <div
                      key={pid}
                      className={cn(
                        "p-4 rounded-xl flex items-center justify-between border transition-all",
                        pid === userId ? "bg-amber-500/5 border-amber-500/30" : "bg-white/5 border-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black",
                          pid === userId ? "bg-amber-500/20 text-amber-400" : "bg-slate-900 text-on-surface-variant"
                        )}>
                          {idx + 1}
                        </div>
                        <span className="text-xs font-bold uppercase">{pid === userId ? "You" : "Opponent"}</span>
                      </div>
                      <span className="text-2xl font-black font-mono">{game.scores[pid]}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6 border-white/5 bg-surface-container-high/40">
                <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">Round History</h3>
                <div className="space-y-2">
                  {game.history?.length > 0 ? (
                    [...game.history].reverse().slice(0, 5).map((h: any, i: number) => (
                      <div key={i} className="text-[10px] flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <span className="text-on-surface-variant">R{h.round}</span>
                        <span className="text-white font-mono">
                          {h.picks[userId]} vs {h.picks[oppId]} → <span className="text-amber-400">{h.target}</span>
                        </span>
                        <span className={cn("font-black uppercase",
                          h.winner === userId ? "text-emerald-400" : h.winner === null ? "text-primary" : "text-red-400"
                        )}>
                          {h.winner === userId ? "Win" : h.winner === null ? "Tie" : "Loss"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-on-surface-variant opacity-40">No rounds played yet.</p>
                  )}
                </div>
              </GlassCard>

              {!isFinished && (
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest transition-all"
                >
                  Forfeit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
