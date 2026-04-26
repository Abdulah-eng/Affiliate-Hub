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
  Lock,
  X,
  Megaphone,
  Image as ImageIcon,
  Upload,
  AlertTriangle,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTasks, completeTask } from "@/app/actions/tasks";
import { submitPromoProof, claimSimplePromo } from "@/app/actions/promos";

export default function AgentTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Promo specific states
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    const res = await getTasks();
    if (res && res.items) {
      setTasks(res.items);
    } else if (Array.isArray(res)) {
      setTasks(res);
    }
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

  const handlePromoSubmit = () => {
    if (!selectedTask) return;
    startTransition(async () => {
      if (selectedTask.requiresVerification) {
        if (!proofFile) {
          alert("Please select a screenshot first.");
          return;
        }
        const formData = new FormData();
        formData.append("promoId", selectedTask.id);
        formData.append("file", proofFile);
        const res = await submitPromoProof(formData);
        if (res.success) {
          setSelectedTask(null);
          setProofFile(null);
          setProofPreview(null);
          fetchTasks();
        } else {
          alert(res.error);
        }
      } else {
        const res = await claimSimplePromo(selectedTask.id);
        if (res.success) {
          setSelectedTask(null);
          fetchTasks();
        } else {
          alert(res.error);
        }
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
            Watch content, participate in propaganda, and extract point rewards into your vault.
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
                  selectedTask?.id === task.id ? "border-primary ring-2 ring-primary/20" : "",
                  task.taskType === "PROMO" ? "border-tertiary/20" : ""
                )}
                onClick={() => {
                  setSelectedTask(task);
                  setVideoEnded(false);
                  setProofFile(null);
                  setProofPreview(null);
                }}
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  {task.taskType === "PROMO" ? <Megaphone size={80} /> : <MonitorPlay size={80} />}
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                      task.taskType === "PROMO" 
                        ? "bg-tertiary/10 text-tertiary group-hover:bg-tertiary group-hover:text-white" 
                        : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-background"
                    )}>
                      {task.taskType === "PROMO" ? <Megaphone size={24} /> : <Play size={24} />}
                    </div>
                    <span className={cn("text-2xl font-black font-mono", task.taskType === "PROMO" ? "text-tertiary" : "text-primary")}>
                       +{task.points}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-on-surface uppercase tracking-tight mb-2">{task.title}</h3>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed mb-6 line-clamp-2">
                    {task.description}
                  </p>
                  
                  {task.taskType === "PROMO" && task.submissionStatus === "PENDING" && (
                    <div className="mb-4 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full w-fit">
                      Verification Pending
                    </div>
                  )}

                  {task.taskType === "PROMO" && task.submissionStatus === "REJECTED" && (
                     <div className="mb-4 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full w-fit">
                        Rejected - Reupload Proof
                     </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      {task.taskType === "PROMO" ? (
                         task.requiresVerification ? <><ImageIcon size={12} /> SS Proof Required</> : <><Zap size={12} /> Instant Claim</>
                      ) : (
                         <><Clock size={12} /> ~2 min video</>
                      )}
                    </span>
                    <ArrowRight size={18} className={cn("transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1", task.taskType === "PROMO" ? "text-tertiary" : "text-primary")} />
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

        {/* Action Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl p-4 md:p-10 flex items-center justify-center overflow-y-auto">
            <div className="w-full max-w-5xl animate-vapor">
              <div className="flex items-center justify-between mb-6">
                <div>
                   <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight">{selectedTask.title}</h2>
                   <p className={cn("text-xs font-bold uppercase tracking-widest mt-1", selectedTask.taskType === "PROMO" ? "text-tertiary" : "text-primary")}>
                     Reward: {selectedTask.points} Kinetic points
                   </p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedTask(null);
                    setProofFile(null);
                    setProofPreview(null);
                  }}
                  className="p-3 rounded-full hover:bg-white/10 text-on-surface-variant transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {selectedTask.taskType === "VIDEO" ? (
                /* VIDEO TASK UI */
                <>
                  <GlassCard className="p-2 border-primary/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="aspect-video bg-black relative rounded-2xl overflow-hidden">
                       {selectedTask.videoUrl?.includes('youtube.com') || selectedTask.videoUrl?.includes('youtu.be') ? (
                         <iframe 
                           className="w-full h-full"
                           src={(() => {
                             const url = selectedTask.videoUrl.replace(/^(https?:\/\/)+/, 'https://');
                             if (url.includes('youtu.be/')) {
                               const id = url.split('youtu.be/')[1]?.split('?')[0];
                               return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
                             }
                             return url.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1&rel=0';
                           })()}
                           title={selectedTask.title}
                           allowFullScreen
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
                        {/* Show manual complete for YouTube iframes since onEnded doesn't fire */}
                        {!videoEnded && (selectedTask.videoUrl?.includes('youtube') || selectedTask.videoUrl?.includes('youtu.be') || selectedTask.videoUrl?.includes('embed')) && (
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
                </>
              ) : (
                /* PROMO UI */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <GlassCard className="p-0 overflow-hidden border-tertiary/20 aspect-video relative bg-slate-950/80">
                      {selectedTask.imageUrl ? (
                        <a href={selectedTask.imageUrl} target="_blank" rel="noreferrer" className="w-full h-full block">
                          <img 
                            src={selectedTask.imageUrl} 
                            alt="" 
                            className="w-full h-full object-contain" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-tertiary/20"><svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-megaphone"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg></div>';
                            }}
                          />
                        </a>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-tertiary/20">
                           <Megaphone size={120} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent flex items-end p-8">
                         <p className="text-sm font-medium italic opacity-80">{selectedTask.description}</p>
                      </div>
                   </GlassCard>

                   <div className="space-y-8 flex flex-col justify-center">
                      {selectedTask.externalLink && (
                        <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
                          <div className="flex items-center gap-2 text-primary">
                            <Zap size={18} />
                            <span className="text-xs font-black uppercase tracking-widest">Mission Link Available</span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant font-medium">Click the button below to open the target post or page for this mission.</p>
                          <a 
                            href={selectedTask.externalLink} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-background rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            Open Mission Link <ArrowRight size={14} />
                          </a>
                        </div>
                      )}

                      {selectedTask.requiresVerification ? (
                        <div className="space-y-6">
                           <div className="flex items-center gap-3 mb-2">
                              <Upload size={20} className="text-tertiary" />
                              <h3 className="text-xl font-black uppercase tracking-tight">Proof Required</h3>
                           </div>
                           <p className="text-xs text-on-surface-variant font-medium">Please upload a screenshot showing your participation/support for this campaign to receive points.</p>
                           
                           <div className="relative group rounded-2xl overflow-hidden aspect-video bg-white/5 border-2 border-dashed border-white/10 hover:border-tertiary/50 transition-all">
                              {proofPreview ? (
                                <img src={proofPreview} alt="Proof" className="w-full h-full object-cover" />
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-40">
                                   <ImageIcon size={40} />
                                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Select Screenshot</span>
                                </div>
                              )}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setProofFile(file);
                                    setProofPreview(URL.createObjectURL(file));
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                           </div>

                           <button 
                             onClick={handlePromoSubmit}
                             disabled={isPending || !proofFile}
                             className="w-full py-5 bg-tertiary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-tertiary/20 flex items-center justify-center gap-3"
                           >
                             {isPending ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                             {isPending ? "DEPLOING PROOF..." : "SUBMIT FOR REVIEW"}
                           </button>
                        </div>
                      ) : (
                        <div className="space-y-6 text-center">
                           <div className="w-24 h-24 rounded-full bg-tertiary/10 border-2 border-tertiary mx-auto flex items-center justify-center text-tertiary shadow-[0_0_30px_rgba(166,140,255,0.2)]">
                              <Trophy size={48} />
                           </div>
                           <div>
                              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Instant Extraction</h3>
                              <p className="text-xs text-on-surface-variant max-w-xs mx-auto italic">No verification required for this transmission. Extraction will credit points immediately.</p>
                           </div>
                           <button 
                             onClick={handlePromoSubmit}
                             disabled={isPending}
                             className="w-full py-5 bg-tertiary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-tertiary/20"
                           >
                             {isPending ? "PROCESSING..." : "EXTRACT REWARD"}
                           </button>
                        </div>
                      )}
                   </div>
                </div>
              )}
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

function XIcon({ size, className }: { size?: number, className?: string }) {
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
