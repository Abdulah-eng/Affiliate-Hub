"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Loader2, 
  Trophy,
  ArrowRight,
  MonitorPlay,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTasks, completeTask } from "@/app/actions/tasks";

export default function AgentTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchTasks = async () => {
    setLoading(true);
    const data = await getTasks();
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleClaimPoints = () => {
    if (!selectedTask || !videoEnded) return;
    startTransition(async () => {
      const res = await completeTask(selectedTask.id);
      if (res.success) {
        setSelectedTask(null);
        setVideoEnded(false);
        fetchTasks();
      } else {
        alert(res.error);
      }
    });
  };

  const onVideoEnd = () => {
    setVideoEnded(true);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="animate-vapor max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20 flex items-center gap-2">
              <Trophy size={12} /> Kinetic Quests Active
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
            Mission <span className="text-primary tracking-normal">Control</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-4">
            Watch content, learn protocol, and extract point rewards into your vault.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Task List */}
        <div className="lg:col-span-12 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTasks.map((task) => (
              <GlassCard 
                key={task.id} 
                className={cn(
                  "p-8 group cursor-pointer hover:border-primary/50 transition-all relative overflow-hidden",
                  selectedTask?.id === task.id ? "border-primary ring-2 ring-primary/20" : ""
                )}
                onClick={() => {
                  setSelectedTask(task);
                  setVideoEnded(false);
                }}
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <MonitorPlay size={80} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all">
                      <Play size={24} />
                    </div>
                    <span className="text-2xl font-black text-primary font-mono">+{task.points}</span>
                  </div>
                  <h3 className="text-xl font-black text-on-surface uppercase tracking-tight mb-2">{task.title}</h3>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed mb-6 line-clamp-2">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      <Clock size={12} /> ~2 min video
                    </span>
                    <ArrowRight size={18} className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </GlassCard>
            ))}

            {activeTasks.length === 0 && (
              <div className="md:col-span-3 py-20 text-center">
                 <Flame size={48} className="mx-auto mb-4 text-primary opacity-20" />
                 <p className="text-on-surface-variant font-black uppercase tracking-widest text-sm">No Missions Available</p>
                 <p className="text-[10px] text-on-surface-variant mt-2 opacity-60">Check back later for new quest protocols.</p>
              </div>
            )}
          </div>
        </div>

        {/* Video Player Modal/Overlay if selected */}
        {selectedTask && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl p-4 md:p-10 flex items-center justify-center overflow-y-auto">
            <div className="w-full max-w-5xl animate-vapor">
              <div className="flex items-center justify-between mb-6">
                <div>
                   <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight">{selectedTask.title}</h2>
                   <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">Reward: {selectedTask.points} Kinetic points</p>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-3 rounded-full hover:bg-white/10 text-on-surface-variant transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <GlassCard className="p-2 border-primary/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="aspect-video bg-black relative rounded-2xl overflow-hidden">
                   {selectedTask.videoUrl?.includes('youtube.com') || selectedTask.videoUrl?.includes('youtu.be') ? (
                     <iframe 
                       className="w-full h-full"
                       src={`${selectedTask.videoUrl.replace('watch?v=', 'embed/')}?autoplay=1&rel=0`}
                       title={selectedTask.title}
                       allowFullScreen
                       // Note: Tracking conclusion of YouTube iframes requires YouTube IFrame API
                       // For simplicity here, we assume HTML5 or use a simple timer/button if it's an embed
                     ></iframe>
                   ) : (
                     <video 
                       ref={videoRef}
                       className="w-full h-full"
                       src={selectedTask.videoUrl} 
                       controls 
                       autoPlay
                       onEnded={onVideoEnd}
                     />
                   )}
                </div>
              </GlassCard>

              <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                      videoEnded ? "bg-emerald-500 text-slate-950 scale-110 shadow-[0_0_20px_#10b981]" : "bg-white/5 text-on-surface-variant"
                    )}>
                       {videoEnded ? <CheckCircle2 size={24} /> : <Clock size={24} className="animate-pulse" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-on-surface uppercase">Completion Status</p>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                        {videoEnded ? "Protocol Concluded - Extract Rewards" : "Mission In Progress - Watch to conclude"}
                      </p>
                    </div>
                 </div>

                 <div className="flex gap-4 w-full md:w-auto">
                    {!videoEnded && selectedTask.videoUrl?.includes('embed') && (
                       /* Fallback for YouTube embeds if API isn't fully wired: manual claim after 30s? No, user said watch & end. */
                       /* For now, for YouTube, we will allow manual claim after selection since we can't easily detect end without API */
                       <button 
                        onClick={() => setVideoEnded(true)}
                        className="px-8 py-4 bg-white/5 border border-white/10 text-on-surface-variant text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10"
                       >
                         I've finished watching
                       </button>
                    )}
                    <button 
                      disabled={!videoEnded || isPending}
                      onClick={handleClaimPoints}
                      className={cn(
                        "flex-1 md:flex-none px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl flex items-center justify-center gap-3",
                        videoEnded 
                          ? "bg-primary text-background hover:scale-105 active:scale-95 shadow-primary/20" 
                          : "bg-white/5 text-on-surface-variant/40 cursor-not-allowed border border-white/5"
                      )}
                    >
                      {isPending ? <Loader2 size={20} className="animate-spin" /> : <Trophy size={20} />}
                      {isPending ? "EXTRACTING..." : "EXTRACT REWARD"}
                    </button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Completed Quests Section */}
        {completedTasks.length > 0 && (
          <div className="lg:col-span-12 pt-10 border-t border-white/5">
            <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-[0.3em] mb-8">Completed Quests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {completedTasks.map(task => (
                <div key={task.id} className="p-6 rounded-2xl border border-white/5 bg-surface-container-low/30 flex items-center gap-4 grayscale opacity-60">
                   <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 size={20} />
                   </div>
                   <div>
                      <p className="text-xs font-black text-on-surface truncate uppercase tracking-tight">{task.title}</p>
                      <p className="text-[10px] text-emerald-500 font-bold">+{task.points} PTS EARNED</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function X({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
