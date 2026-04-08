"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Shield,
  Users,
  ArrowUp,
  ArrowDown,
  Clock,
  Trophy,
  Skull,
  Sparkles,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
  Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  joinAllianceQueue,
  getActiveAlliance,
  playAllianceTurn,
  leaveAllianceQueue,
} from "@/app/actions/alliance";

const TEAM_COLORS = [
  { accent: "cyan", border: "border-cyan-500/30", bg: "bg-cyan-500/10", text: "text-cyan-400", glow: "shadow-[0_0_20px_rgba(6,182,212,0.2)]" },
  { accent: "purple", border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-400", glow: "shadow-[0_0_20px_rgba(168,85,247,0.2)]" },
];

const getCardLabel = (v: number) => {
  if (v === 1) return "A";
  if (v === 11) return "J";
  if (v === 12) return "Q";
  if (v === 13) return "K";
  return String(v);
};

export function AllianceClient({ userId }: { userId: string }) {
  const [phase, setPhase] = useState<"IDLE" | "SEARCHING" | "PLAYING">("IDLE");
  const [game, setGame] = useState<any>(null);
  const [stake, setStake] = useState(500);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFlash, setLastFlash] = useState<"correct" | "wrong" | null>(null);
  const [cardFlip, setCardFlip] = useState(false);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  const refreshGame = useCallback(async () => {
    const g = await getActiveAlliance();
    if (g) {
      setGame((prev: any) => {
        if (prev && prev.currentCard !== g.currentCard) {
          setCardFlip(true);
          setTimeout(() => setCardFlip(false), 500);
        }
        return g;
      });
      if (phase === "SEARCHING") setPhase("PLAYING");
      if (g.status === "FINISHED") stopPolling();
    }
  }, [phase]);

  useEffect(() => {
    const isMyTurn = game?.activeTurn?.playerId === userId;
    if (phase === "SEARCHING" || (phase === "PLAYING" && game?.status === "PLAYING" && !isMyTurn)) {
      pollRef.current = setInterval(refreshGame, 2000);
    } else {
      stopPolling();
    }
    return stopPolling;
  }, [phase, game?.status, game?.activeTurn?.playerId, userId, refreshGame]);

  const handleJoin = async () => {
    setError(null);
    setIsPending(true);
    const res = await joinAllianceQueue(stake);
    if (res.success) {
      if (res.status === "game_started") {
        const g = await getActiveAlliance();
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

  const handleGuess = async (guess: "HIGHER" | "LOWER") => {
    if (!game || isPending || game.activeTurn?.playerId !== userId || game.status !== "PLAYING") return;
    setIsPending(true);
    const res = await playAllianceTurn(guess);
    if (res.success) {
      setLastFlash(res.correct ? "correct" : "wrong");
      setTimeout(() => setLastFlash(null), 2500);
      setCardFlip(true);
      setTimeout(() => setCardFlip(false), 500);
      setGame(res.game);
    } else {
      setError(res.error ?? "Move failed");
    }
    setIsPending(false);
  };

  const handleReset = () => {
    setGame(null);
    setPhase("IDLE");
    setError(null);
    setLastFlash(null);
    stopPolling();
  };

  const handleCancelSearch = async () => {
    setIsPending(true);
    await leaveAllianceQueue();
    setPhase("IDLE");
    setIsPending(false);
  };

  // Derive my team index
  const myTeamIdx = game?.teams
    ? game.teams.findIndex((team: string[]) => team.includes(userId))
    : -1;
  const enemyTeamIdx = myTeamIdx === 0 ? 1 : 0;
  const isMyTurn = game?.activeTurn?.playerId === userId;
  const isFinished = game?.status === "FINISHED";
  const myPot = isFinished && myTeamIdx !== -1
    ? (game.scores[`team${myTeamIdx}`] > game.scores[`team${enemyTeamIdx}`] ? "WON" :
       game.scores[`team${myTeamIdx}`] < game.scores[`team${enemyTeamIdx}`] ? "LOST" : "DRAW")
    : null;

  return (
    <div className="animate-vapor pt-4 max-w-5xl mx-auto space-y-10">

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-500/20">
          <Users size={12} /> 2v2 Team Arena
        </div>
        <h2 className="text-5xl font-black font-headline tracking-tighter uppercase">
          Kinetic <span className="text-cyan-400 text-6xl">Alliance</span>
        </h2>
        <p className="text-on-surface-variant text-sm opacity-60 font-medium">
          Two teams of two. Alternate higher/lower card predictions. Most correct rounds wins the pot.
        </p>
      </div>

      {/* ── IDLE ────────────────────────────────────────────────────────── */}
      {phase === "IDLE" && (
        <div className="flex justify-center">
          <GlassCard className="p-10 w-full max-w-md bg-surface-container-low/40 border-cyan-500/20 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] block">Your Stake (per player)</label>
              <div className="grid grid-cols-3 gap-3">
                {[500, 1000, 5000].map(val => (
                  <button
                    key={val}
                    onClick={() => setStake(val)}
                    className={cn(
                      "py-3 rounded-xl font-black text-sm border-2 transition-all",
                      stake === val
                        ? "bg-cyan-500 text-background border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                        : "bg-white/5 border-white/5 hover:border-cyan-500/40"
                    )}
                  >
                    {val.toLocaleString()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant opacity-50 text-center">
                Total pot: <span className="text-cyan-400 font-black">{(stake * 4).toLocaleString()} PTS</span> — Winning team each gets{" "}
                <span className="text-emerald-400 font-black">{Math.floor(stake * 1.9).toLocaleString()} PTS</span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-on-surface-variant">
              <p className="font-black text-cyan-400 uppercase tracking-widest mb-1 text-[9px]">How teams work</p>
              <p className="leading-relaxed opacity-70">You'll be auto-matched with 3 others. First 2 in queue = Team Cyan, last 2 = Team Purple. You need 4 players to start.</p>
            </div>
            <button
              onClick={handleJoin}
              disabled={isPending}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-background py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isPending ? "JOINING..." : "JOIN QUEUE"}
            </button>
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-[10px] font-black uppercase tracking-widest">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* ── SEARCHING ───────────────────────────────────────────────────── */}
      {phase === "SEARCHING" && (
        <div className="flex flex-col items-center gap-8 py-20">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] animate-pulse rounded-full" />
            <Users size={80} className="text-cyan-400 animate-bounce relative z-10" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-black uppercase tracking-tighter">Assembling teams…</p>
            <p className="text-xs text-on-surface-variant opacity-60">Need 4 players total. Waiting for others to join.</p>
          </div>
          <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
            <Clock size={12} /> 1–3 players in queue. Waiting…
          </div>
          <button
            onClick={handleCancelSearch}
            disabled={isPending}
            className="px-8 py-3 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest transition-all"
          >
            Leave Queue
          </button>
        </div>
      )}

      {/* ── GAME ────────────────────────────────────────────────────────── */}
      {phase === "PLAYING" && game && (
        <div className="relative">

          {/* Finish overlay */}
          {isFinished && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-xl rounded-3xl animate-in fade-in duration-500">
              <div className="text-center p-12 space-y-6">
                {myPot === "WON" ? (
                  <>
                    <div className="relative mx-auto w-28 h-28">
                      <div className="absolute inset-0 bg-cyan-500/30 blur-[50px] rounded-full animate-pulse" />
                      <div className="w-28 h-28 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center">
                        <Trophy size={56} className="text-cyan-400 fill-current" />
                      </div>
                    </div>
                    <h2 className="text-5xl font-black uppercase text-cyan-400 tracking-tighter">ALLIANCE WINS!</h2>
                    <p className="text-on-surface-variant">
                      Each teammate claimed <span className="text-emerald-400 font-black text-xl">{Math.floor(stake * 1.9).toLocaleString()} PTS</span>
                    </p>
                    <p className="text-sm text-on-surface-variant opacity-50">
                      {game.scores[`team${myTeamIdx}`]} — {game.scores[`team${enemyTeamIdx}`]} rounds
                    </p>
                  </>
                ) : myPot === "DRAW" ? (
                  <>
                    <div className="w-28 h-28 rounded-full bg-primary/20 border-2 border-primary mx-auto flex items-center justify-center">
                      <Sparkles size={56} className="text-primary" />
                    </div>
                    <h2 className="text-5xl font-black uppercase text-primary tracking-tighter">DRAW!</h2>
                    <p className="text-on-surface-variant opacity-70">All stakes returned.</p>
                  </>
                ) : (
                  <>
                    <div className="w-28 h-28 rounded-full bg-red-500/20 border-2 border-red-500 mx-auto flex items-center justify-center">
                      <Skull size={56} className="text-red-500" />
                    </div>
                    <h2 className="text-5xl font-black uppercase text-red-500 tracking-tighter">ELIMINATED</h2>
                    <p className="text-on-surface-variant opacity-60">
                      {game.scores[`team${myTeamIdx}`]} — {game.scores[`team${enemyTeamIdx}`]} rounds
                    </p>
                  </>
                )}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-cyan-500 text-background font-black uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.02] mx-auto"
                >
                  <RotateCw size={16} /> PLAY AGAIN
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Team Scores */}
            <div className="lg:col-span-4 space-y-4">
              {([0, 1] as const).map(ti => {
                const tc = TEAM_COLORS[ti];
                const isMyTeam = ti === myTeamIdx;
                const teamScore = game.scores[`team${ti}`];
                const members: string[] = game.teams?.[ti] ?? [];
                return (
                  <GlassCard key={ti} className={cn("p-6 border transition-all", tc.border, isMyTeam ? tc.bg : "bg-surface-container-high/40")}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className={tc.text} />
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.3em]", tc.text)}>
                          Team {ti === 0 ? "Cyan" : "Purple"} {isMyTeam && "(You)"}
                        </span>
                      </div>
                      <span className="text-3xl font-black font-mono">{teamScore}</span>
                    </div>
                    <div className="space-y-2">
                      {members.map((pid, pi) => {
                        const isActive = game.activeTurn?.playerId === pid && !isFinished;
                        const isMe = pid === userId;
                        return (
                          <div
                            key={pid}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-xl border text-xs transition-all",
                              isActive ? `${tc.bg} ${tc.border} ${tc.glow}` : "bg-white/[0.02] border-white/5",
                            )}
                          >
                            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black",
                              isActive ? tc.text + " bg-white/10" : "bg-slate-900 text-on-surface-variant"
                            )}>
                              {isActive ? <Zap size={12} /> : pi + 1}
                            </div>
                            <span className="font-bold uppercase tracking-tight">
                              {isMe ? "You" : `Player ${pi + 1}`}
                            </span>
                            {isActive && (
                              <span className={cn("ml-auto text-[9px] font-black uppercase tracking-widest animate-pulse", tc.text)}>
                                Their Turn
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>
                );
              })}

              {/* Round progress */}
              <GlassCard className="p-5 border-white/5">
                <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Round Progress</p>
                <div className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: game.maxRounds }).map((_, i) => {
                    const h = game.history?.[i];
                    const teamColor = h ? TEAM_COLORS[h.teamIdx] : null;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black border transition-all",
                          h
                            ? h.correct ? `${teamColor!.bg} ${teamColor!.border} ${teamColor!.text}` : "bg-red-500/10 border-red-500/20 text-red-400"
                            : i === game.round - 1 ? "bg-white/10 border-white/20 animate-pulse" : "bg-white/[0.03] border-white/5 text-on-surface-variant/30"
                        )}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[9px] text-on-surface-variant opacity-40 mt-3">
                  Round {Math.min(game.round, game.maxRounds)} of {game.maxRounds}
                </p>
              </GlassCard>
            </div>

            {/* Main Card + Controls */}
            <div className="lg:col-span-8">
              <GlassCard className="p-10 bg-slate-950/60 border-cyan-500/20 min-h-[480px] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Swords size={120} className="text-cyan-400" />
                </div>

                {/* Active turn badge */}
                <div className={cn(
                  "mb-8 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 transition-all",
                  isMyTurn && !isFinished
                    ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                    : "bg-white/5 border-white/10 text-on-surface-variant"
                )}>
                  {isMyTurn && !isFinished ? <><Zap size={12} /> Your Turn — Pick Higher or Lower!</> : <><Clock size={12} /> Waiting for active player…</>}
                </div>

                {/* Last turn flash */}
                {lastFlash && (
                  <div className={cn(
                    "mb-6 px-6 py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in zoom-in-90 duration-300",
                    lastFlash === "correct" ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
                  )}>
                    {lastFlash === "correct" ? <><CheckCircle2 size={16} /> Correct! +1 for your team</> : <><XCircle size={16} /> Wrong guess</>}
                  </div>
                )}

                {/* Card */}
                <div className="relative group my-4">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-[50px] group-hover:bg-cyan-500/30 transition-all rounded-full" />
                  <div className={cn(
                    "w-40 h-56 rounded-3xl bg-white flex items-center justify-center text-7xl font-black text-slate-950 shadow-2xl border-8 border-slate-200 transition-all duration-300",
                    cardFlip && "scale-90 opacity-60"
                  )}>
                    {getCardLabel(game.currentCard)}
                  </div>
                </div>
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] mb-8 animate-pulse">Active Card</p>

                {/* History of last move */}
                {game.history?.length > 0 && (
                  <div className="mb-6 text-xs text-on-surface-variant opacity-50 text-center">
                    Last: {getCardLabel(game.history.at(-1).currentCard)} → {game.history.at(-1).guess} →{" "}
                    <span className={game.history.at(-1).correct ? "text-emerald-400" : "text-red-400"}>
                      {getCardLabel(game.history.at(-1).nextCard)} ({game.history.at(-1).correct ? "✓" : "✗"})
                    </span>
                  </div>
                )}

                {/* H/L Controls */}
                <div className="w-full flex gap-4">
                  <button
                    onClick={() => handleGuess("HIGHER")}
                    disabled={!isMyTurn || isFinished || isPending}
                    className="flex-1 bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 py-6 rounded-2xl flex flex-col items-center gap-2 transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="text-emerald-400 group-hover:-translate-y-1 transition-transform" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Higher</span>
                  </button>
                  <button
                    onClick={() => handleGuess("LOWER")}
                    disabled={!isMyTurn || isFinished || isPending}
                    className="flex-1 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 py-6 rounded-2xl flex flex-col items-center gap-2 transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="text-red-400 group-hover:translate-y-1 transition-transform" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Lower</span>
                  </button>
                </div>

                {isPending && (
                  <div className="mt-5 flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                    <Zap size={12} /> Processing…
                  </div>
                )}
                {error && (
                  <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-[10px] font-black">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
