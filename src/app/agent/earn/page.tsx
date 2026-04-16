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
  PlayCircle,
  Coins,
  CheckCircle,
  Zap,
  Info,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTasks, completeTask } from "@/app/actions/tasks";
import { submitPromoProof, claimSimplePromo } from "@/app/actions/promos";
import { getSystemSettings } from "@/app/actions/admin";

export default function EarnPage() {
  const [activeTab, setActiveTab] = useState<"protocol" | "missions">("protocol");
  const [tasks, setTasks] = useState<any[]>([]);
  const [dailyCount, setDailyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [player, setPlayer] = useState<any>(null); // YT Player Instance
  const [isVideoPaused, setIsVideoPaused] = useState(true);
  const [interactionTimestamp, setInteractionTimestamp] = useState<number | null>(null);
  const [interactionVisible, setInteractionVisible] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  // Timer Effect
  useEffect(() => {
    if (selectedTask && selectedTask.taskType === "VIDEO" && !videoEnded) {
      if (!isVideoPaused) {
        if (timer === 0) setTimer(30); // Reset timer if not set
        timerRef.current = setInterval(() => {
          setTimer(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      // setTimer(0); // Don't clear timer so it resumes
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [selectedTask, videoEnded, isVideoPaused, timer]);

  // YouTube API Loader
  useEffect(() => {
    if (selectedTask?.taskType === "VIDEO" && (selectedTask.videoUrl?.includes('youtube') || selectedTask.videoUrl?.includes('youtu.be'))) {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      (window as any).onYouTubeIframeAPIReady = () => {
         // This might not fire if script already loaded, handled by manual check
      };
    }
  }, [selectedTask]);

  // Interaction Logic
  useEffect(() => {
    if (selectedTask && !videoEnded && !isVideoPaused) {
        // Randomly set interaction pulse between 10-25 seconds left
        if (interactionTimestamp === null) {
            setInteractionTimestamp(Math.floor(Math.random() * 15) + 10);
        }
        
        if (timer === interactionTimestamp && !interactionVisible) {
            setInteractionVisible(true);
            setIsVideoPaused(true); // Forced pause
            if (player) player.pauseVideo();
            if (videoRef.current) videoRef.current.pause();
        }
    }
  }, [timer, selectedTask, videoEnded, isVideoPaused, interactionTimestamp, interactionVisible, player]);

  const fetchTasks = async () => {
    setLoading(true);
    const [taskRes, settingRes] = await Promise.all([
      getTasks(),
      getSystemSettings()
    ]);
    
    if (taskRes.items) {
      setTasks(taskRes.items);
      setDailyCount(taskRes.dailyCount || 0);
    }

    if (settingRes) {
      const sMap = settingRes.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);
      setSettings(sMap);
    }

    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  // Proxies for script communication
  useEffect(() => {
    (window as any).setYTPlayer = setPlayer;
    (window as any).setVideoStatus = setIsVideoPaused;
    (window as any).setVideoEndedProxy = setVideoEnded;
  }, []);

  const handleClaimPoints = () => {
    const isYoutube = selectedTask?.videoUrl?.includes('youtube') || selectedTask?.videoUrl?.includes('youtu.be') || selectedTask?.videoUrl?.includes('embed');
    const canClaim = videoEnded || (isYoutube && timer === 0);
    
    if (!selectedTask || !canClaim) return;
    startTransition(async () => {
      const res = await completeTask(selectedTask.id);
      if (res.success) {
        if ((res as any).pending) {
           // Mission submitted, don't clear until proof is uploaded? 
           // No, completeTask marks it PENDING.
        }
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
      // It's a task if it doesn't have a prize or has taskId
      const isTask = !selectedTask.prize && !selectedTask.promoId; 
      
      if (selectedTask.requiresVerification) {
        if (!proofFile) {
          alert("Please select a screenshot first.");
          return;
        }
        const formData = new FormData();
        formData.append(isTask ? "taskId" : "promoId", selectedTask.id);
        formData.append("file", proofFile);
        
        const res = await (isTask ? import("@/app/actions/tasks").then(m => m.submitTaskProof(formData)) : submitPromoProof(formData));
        
        if (res.success) {
          setSelectedTask(null);
          setProofFile(null);
          setProofPreview(null);
          fetchTasks();
        } else {
          alert(res.error);
        }
      } else {
        const res = await (isTask ? completeTask(selectedTask.id) : claimSimplePromo(selectedTask.id));
        if (res.success) {
          setSelectedTask(null);
          fetchTasks();
        } else {
          alert(res.error);
        }
      }
    });
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  // Calculate Progress
  const goalCount = 3;
  const progressPercent = Math.min(100, (dailyCount / goalCount) * 100);

  return (
    <div className="animate-vapor max-w-7xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20 flex items-center gap-2">
              <Zap size={12} className="text-primary animate-pulse" /> Earning Protocols Active
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase italic leading-none">
            Kinetic <span className="text-primary tracking-normal italic-none">Earn</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-4">
            Master the protocol, deploy referral links, and extract massive point rewards.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/5 shadow-2xl">
          <button 
            onClick={() => setActiveTab("protocol")}
            className={cn(
              "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2",
              activeTab === "protocol" ? "bg-primary text-slate-950 shadow-[0_0_20px_rgba(129,236,255,0.4)]" : "text-on-surface-variant hover:text-white"
            )}
          >
            <PlayCircle size={16} /> Tutorial
          </button>
          <button 
            onClick={() => setActiveTab("missions")}
            className={cn(
              "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2",
              activeTab === "missions" ? "bg-primary text-slate-950 shadow-[0_0_20px_rgba(129,236,255,0.4)]" : "text-on-surface-variant hover:text-white"
            )}
          >
            <Trophy size={16} /> Missions
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          {activeTab === "protocol" ? (
            /* PROTOCOL TAB: TUTORIAL */
            <div className="space-y-10">
              {/* Earning info banner */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <Info size={16} className="text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                  {settings['CMS_EARN_DESC'] || (
                    <>
                      <span className="text-primary font-bold">Yes, you earn!</span> Every video mission in the <span className="font-bold text-on-surface">Missions</span> tab rewards you with Kinetic Points upon completion. Watch the full video, then click <span className="font-bold text-on-surface">Extract Reward</span> to claim.
                    </>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-fit">
                {[
                  'CMS_EARN_VIDEO',
                  'CMS_EARN_VIDEO_2',
                  'CMS_EARN_VIDEO_3',
                  'CMS_EARN_VIDEO_4',
                  'CMS_EARN_VIDEO_5'
                ].filter(key => settings[key]).map((key, index) => (
                  <div key={key} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">0{index + 1}</span>
                      <h3 className="text-sm font-black uppercase tracking-widest text-on-surface">Transmission Protocol</h3>
                    </div>
                    <GlassCard className="p-2 border-primary/20 overflow-hidden group">
                      <div className="aspect-video bg-black relative rounded-2xl overflow-hidden shadow-2xl">
                        {settings[key].includes('youtube.com') || settings[key].includes('youtu.be') ? (
                          <iframe 
                            src={`https://www.youtube.com/embed/${settings[key].match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|u\/\w\/))([^\?&"'>]+)/)?.[1]}?autoplay=0&rel=0`} 
                            className="w-full h-full border-0"
                            allowFullScreen
                          />
                        ) : (
                          <video src={settings[key]} controls className="w-full h-full" />
                        )}
                      </div>
                    </GlassCard>
                  </div>
                ))}

                {/* Fallback if no videos */}
                {![
                  'CMS_EARN_VIDEO',
                  'CMS_EARN_VIDEO_2',
                  'CMS_EARN_VIDEO_3',
                  'CMS_EARN_VIDEO_4',
                  'CMS_EARN_VIDEO_5'
                ].some(key => settings[key]) && (
                  <div className="md:col-span-2">
                    <GlassCard className="p-2 border-primary/20 overflow-hidden group">
                      <div className="aspect-video bg-gradient-to-br from-slate-900 via-slate-950 to-black flex items-center justify-center rounded-2xl">
                        <div className="text-center">
                           <PlayCircle size={80} className="text-primary opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 mx-auto mb-4" />
                           <p className="text-primary font-black uppercase tracking-[0.3em] text-xs">Earning Protocol Video</p>
                           <p className="text-[10px] text-on-surface-variant mt-2 italic opacity-60">Wait for protocol deployment...</p>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-tight text-on-surface flex items-center gap-3">
                    <Info size={24} className="text-primary" /> Execution Steps
                  </h3>
                  <div className="space-y-4">
                    {(settings['CMS_EARN_STEPS_JSON'] ? JSON.parse(settings['CMS_EARN_STEPS_JSON']) : [
                      "Initialize your unique referral link",
                      "Broadcast across FB, TikTok, and Groups",
                      "Enlist new players into the Kinetic Vault",
                      "Extract commission + bounty points"
                    ]).map((step: string, i: number) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-primary font-black group-hover:bg-primary group-hover:text-slate-950 transition-all font-mono">
                          {i + 1}
                        </div>
                        <p className="text-sm font-medium text-on-surface-variant p-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-tight text-on-surface flex items-center gap-3">
                    <Flame size={24} className="text-primary" /> Pro-Tips
                  </h3>
                  <GlassCard className="p-6 bg-white/[0.02] border-white/5">
                    <ul className="space-y-4">
                       {(settings['CMS_EARN_TIPS_JSON'] ? JSON.parse(settings['CMS_EARN_TIPS_JSON']) : [
                         { label: "Groups", text: "Post in groups with over 10k members for maximum extraction." },
                         { label: "Videos", text: "Missions with video content provide the highest point stability." }
                       ]).map((tip: any, i: number) => (
                         <li key={i} className="text-xs text-on-surface-variant leading-relaxed">
                            <span className="text-primary font-bold">{tip.label}:</span> {tip.text}
                         </li>
                       ))}
                    </ul>
                  </GlassCard>
                  
                  <button 
                    onClick={() => setActiveTab("missions")}
                    className="w-full py-5 bg-primary text-slate-950 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:translate-y-[-2px] active:translate-y-[0] transition-all shadow-[0_10px_30px_rgba(129,236,255,0.2)] flex items-center justify-center gap-3"
                  >
                    Start Missions <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* MISSIONS TAB */
            <div className="space-y-8 animate-vapor">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {activeTasks.map((task) => {
                    const getThumbnail = (url: string) => {
                      if (!url) return null;
                      if (url.includes('youtube.com') || url.includes('youtu.be')) {
                        const id = url.includes('watch?v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
                        return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
                      }
                      return task.imageUrl || null;
                    };
                    const thumbnail = getThumbnail(task.taskType === "PROMO" ? task.imageUrl : task.videoUrl);

                    return (
                      <GlassCard 
                        key={task.id} 
                        className={cn(
                          "p-0 group cursor-pointer hover:border-primary/50 transition-all relative overflow-hidden flex flex-col min-h-[220px]",
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
                        {/* Background Thumbnail */}
                        <div className="absolute inset-0 z-0">
                          {thumbnail ? (
                            <img src={thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center opacity-40">
                               {task.taskType === "PROMO" ? <Megaphone size={60} /> : <MonitorPlay size={60} />}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-0" />
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                        </div>

                        <div className="relative z-10 p-8 flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                task.taskType === "PROMO" 
                                  ? "bg-tertiary/20 text-tertiary group-hover:bg-tertiary group-hover:text-white" 
                                  : "bg-primary/20 text-primary group-hover:bg-primary group-hover:text-background"
                              )}>
                                {task.taskType === "PROMO" ? <Megaphone size={20} /> : <Play size={20} />}
                              </div>
                              <span className={cn("text-2xl font-black font-mono drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]", task.taskType === "PROMO" ? "text-tertiary" : "text-primary")}>
                                +{task.points}
                              </span>
                            </div>
                            
                            <div>
                              <h3 className="text-xl font-black text-on-surface uppercase tracking-tight mb-2 drop-shadow-md">{task.title}</h3>
                              <p className="text-xs text-on-surface-variant font-medium leading-relaxed line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                {task.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="pt-4 mt-4 border-t border-white/10">
                            {task.taskType === "PROMO" && task.submissionStatus === "PENDING" && (
                              <div className="mb-4 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full w-fit">
                                Verification Pending
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                                {task.taskType === "PROMO" ? (
                                  task.requiresVerification ? <ImageIcon size={12} /> : <Zap size={12} />
                                ) : (
                                  <Clock size={12} />
                                )}
                                {task.taskType === "PROMO" ? (task.requiresVerification ? "SS Required" : "Instant") : "~2 min"}
                              </span>
                              <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all font-black text-[10px] uppercase tracking-widest translate-x-4 group-hover:translate-x-0">
                                Launch Mission <ArrowRight size={14} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    );
                 })}

                 {activeTasks.length === 0 && (
                    <div className="col-span-full py-20 text-center glass-card border-dashed">
                       <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500 opacity-40" />
                       <p className="text-on-surface-variant font-black uppercase tracking-widest text-sm">All Missions Concluded</p>
                       <p className="text-[10px] text-on-surface-variant mt-2 opacity-60 italic">Scan protocols for new mission transmissions...</p>
                    </div>
                 )}
               </div>
            </div>
          )}
        </div>

        {/* Sidebar: Goals & Progress */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-8 space-y-8 sticky top-32">
            <div>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mb-4">Tactical Status</p>
              <h3 className="text-2xl font-black text-on-surface uppercase tracking-tighter italic">Daily <span className="text-primary tracking-normal">Goals</span></h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest italic">Mission Progress</span>
                <span className="text-sm font-black text-primary font-mono italic">{dailyCount}/{goalCount}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-primary shadow-[0_0_15px_#81ecff] transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant italic opacity-60">
                Complete {goalCount} missions to trigger a protocol bonus.
              </p>
            </div>

            <div className={cn(
              "p-6 rounded-2xl border transition-all duration-500 flex items-center gap-5",
              dailyCount >= goalCount 
                ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]" 
                : "bg-white/[0.02] border-white/5"
            )}>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                dailyCount >= goalCount ? "bg-emerald-500 text-slate-950" : "bg-white/5 text-on-surface-variant"
              )}>
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-tight text-on-surface">Daily Bonus</p>
                <p className={cn(
                  "text-lg font-black font-mono",
                  dailyCount >= goalCount ? "text-emerald-500" : "text-on-surface-variant opacity-40"
                )}>
                  +200 PTS
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
               <div className="flex items-center gap-3">
                  <Flame size={14} className="text-primary" />
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Active Streak: 4 Days</span>
               </div>
               <div className="flex items-center gap-3">
                  <Coins size={14} className="text-primary" />
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Bounty: 12.5k PTS</span>
               </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Action Modal (copied logic from tasks/page.tsx) */}
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

            {/* Admin Instructions Section for Video/Mission */}
            <div className="mb-8 p-6 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                   <div className="flex items-center gap-3">
                      <Info size={16} className="text-primary" />
                      <h3 className="text-sm font-black uppercase tracking-tight text-on-surface">Instruction</h3>
                   </div>
                   <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
                      {(() => {
                        const text = selectedTask.description || "Watch the protocol transmission below and perform any secondary actions requested.";
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        const parts = text.split(urlRegex);
                        return parts.map((part: string, i: number) => {
                          if (part.match(urlRegex)) {
                            return (
                              <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold break-all">
                                {part}
                              </a>
                            );
                          }
                          return part;
                        });
                      })()}
                   </p>
                </div>
                
                {selectedTask.externalLink && (
                  <a 
                    href={selectedTask.externalLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full md:w-auto px-8 py-4 bg-primary text-slate-950 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.05] active:scale-[0.95] transition-all shadow-lg flex items-center justify-center gap-3 border border-primary/20"
                  >
                    <ExternalLink size={14} /> Open Mission Link
                  </a>
                )}
            </div>

            {selectedTask.taskType === "VIDEO" ? (
              /* VIDEO TASK UI */
              <>
                 <GlassCard className="p-2 border-primary/20 overflow-hidden max-w-4xl mx-auto relative">
                  <div className="aspect-video max-h-[60vh] bg-black relative rounded-2xl overflow-hidden shadow-2xl">
                     {selectedTask.videoUrl?.includes('youtube.com') || selectedTask.videoUrl?.includes('youtu.be') ? (
                        <div id="yt-player" className="w-full h-full"></div>
                     ) : (
                       <video 
                         ref={videoRef}
                         className="w-full h-full"
                         src={selectedTask.videoUrl} 
                         controls 
                         autoPlay
                         onPlay={() => setIsVideoPaused(false)}
                         onPause={() => setIsVideoPaused(true)}
                         onEnded={() => setVideoEnded(true)}
                       />
                     )}
                  </div>
                  
                  {/* Micro Interaction Overlay */}
                  {interactionVisible && (
                    <div className="absolute inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 animate-pulse border border-primary/30">
                            <Zap size={40} className="text-primary" />
                        </div>
                        <h3 className="text-2xl font-black text-on-surface uppercase tracking-tight mb-2">Verifying Link...</h3>
                        <p className="text-sm text-on-surface-variant font-medium mb-8">Tap the button below to continue the uplink.</p>
                        <button 
                            onClick={() => {
                                setInteractionVisible(false);
                                setIsVideoPaused(false);
                                if (player) player.playVideo();
                                if (videoRef.current) videoRef.current.play();
                            }}
                            className="px-12 py-5 bg-primary text-background rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(129,236,255,0.4)] hover:scale-105 transition-all"
                        >
                            Continue Mission
                        </button>
                    </div>
                  )}
                </GlassCard>

                {/* Effect to initialize YT Player */}
                <script dangerouslySetInnerHTML={{ __html: `
                    function initYT() {
                        if (window.YT && window.YT.Player && document.getElementById('yt-player')) {
                             new window.YT.Player('yt-player', {
                                videoId: '${(() => {
                                    const url = selectedTask.videoUrl;
                                    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0];
                                    return url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
                                })()}',
                                playerVars: { 'autoplay': 1, 'controls': 1, 'rel': 0, 'modestbranding': 1 },
                                events: {
                                    'onReady': (event) => window.setYTPlayer(event.target),
                                    'onStateChange': (event) => {
                                        if (event.data == window.YT.PlayerState.PLAYING) window.setVideoStatus(false);
                                        else window.setVideoStatus(true);
                                        if (event.data == window.YT.PlayerState.ENDED) window.setVideoEndedProxy(true);
                                    }
                                }
                             });
                        } else {
                            setTimeout(initYT, 500);
                        }
                    }
                    initYT();
                `}} />
                
                {/* Proxies for script communication moved to top level */}

                <div className="mt-8 flex flex-col items-center justify-between gap-6">
                   <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                      <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                            videoEnded ? "bg-emerald-500 text-slate-950 scale-110 shadow-[0_0_20px_#10b981]" : "bg-white/5 text-on-surface-variant"
                          )}>
                            {videoEnded ? <CheckCircle2 size={24} /> : <Clock size={24} className="animate-pulse" />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-on-surface uppercase tracking-tight">Completion Status</p>
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                              {videoEnded ? "Protocol Concluded" : isVideoPaused ? "Mission Paused" : "Mission In Progress"}
                            </p>
                          </div>
                      </div>

                      <div className="flex-1">
                         {!videoEnded && (
                            <div className="px-6 py-4 bg-white/5 border border-white/10 text-on-surface-variant text-[10px] font-black uppercase tracking-widest rounded-xl text-center md:text-left">
                                {timer > 0 ? `Verifying Protocol: ${timer}s remaining` : "Protocol Verified. You can now extract reward."}
                            </div>
                         )}
                      </div>

                      <div className="flex gap-4 w-full md:w-auto">
                          {selectedTask.requiresVerification ? (
                             <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                                <div className="relative group rounded-xl overflow-hidden h-14 w-full md:w-48 bg-white/5 border border-white/10 hover:border-primary/50 transition-all flex items-center justify-center gap-2">
                                    {proofPreview ? (
                                      <img src={proofPreview} alt="Proof" className="w-full h-full object-cover" />
                                    ) : (
                                       <>
                                        <Upload size={14} className="text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Proof</span>
                                       </>
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
                                  disabled={(timer > 0 && !videoEnded) || isPending}
                                  onClick={handlePromoSubmit}
                                  className={cn(
                                    "px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl flex items-center justify-center gap-3 w-full",
                                    (videoEnded || timer === 0) 
                                      ? "bg-primary text-background hover:scale-105 active:scale-95 shadow-primary/20" 
                                      : "bg-white/5 text-on-surface-variant/40 cursor-not-allowed border border-white/5"
                                  )}
                                >
                                  {isPending ? <Loader2 size={20} className="animate-spin" /> : <Trophy size={20} />}
                                  {isPending ? "SUBMITTING..." : "SUBMIT PROOF"}
                                </button>
                             </div>
                          ) : (
                            <button 
                              disabled={(!videoEnded && (selectedTask.videoUrl?.includes('youtube') || selectedTask.videoUrl?.includes('youtu.be') || selectedTask.videoUrl?.includes('embed') ? timer > 0 : true)) || isPending}
                              onClick={handleClaimPoints}
                              className={cn(
                                "flex-1 md:flex-none px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl flex items-center justify-center gap-3",
                                (videoEnded || (timer === 0 && (selectedTask.videoUrl?.includes('youtube') || selectedTask.videoUrl?.includes('youtu.be') || selectedTask.videoUrl?.includes('embed')))) 
                                  ? "bg-primary text-background hover:scale-105 active:scale-95 shadow-primary/20" 
                                  : "bg-white/5 text-on-surface-variant/40 cursor-not-allowed border border-white/5"
                              )}
                            >
                              {isPending ? <Loader2 size={20} className="animate-spin" /> : <Trophy size={20} />}
                              {isPending ? "EXTRACTING..." : "EXTRACT REWARD"}
                            </button>
                          )}
                      </div>
                   </div>
                </div>
              </>
            ) : (
              /* PROMO & SOCIAL TASK UI */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <GlassCard className="p-0 overflow-hidden border-tertiary/20 flex flex-col items-center justify-center bg-slate-900/50 relative min-h-[350px] md:min-h-[500px] max-h-[75vh]">
                    <div className="flex-1 w-full flex items-center justify-center p-4">
                      {selectedTask.imageUrl ? (
                        <img src={selectedTask.imageUrl} alt="" className="max-w-full max-h-full object-contain animate-in fade-in zoom-in-95 duration-500 shadow-2xl rounded-lg" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-tertiary/20">
                           {selectedTask.taskType === "PROMO" ? <Megaphone size={120} /> : <Zap size={120} />}
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  <div className="space-y-6 flex flex-col justify-center">
                     {selectedTask.requiresVerification ? (
                       <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-2">
                             <Upload size={20} className="text-tertiary" />
                             <h3 className="text-xl font-black uppercase tracking-tight">Proof Required</h3>
                          </div>
                          <p className="text-xs text-on-surface-variant font-medium">Please upload a screenshot (Proof of Work) showing your participation.</p>
                         
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
                            <p className="text-xs text-on-surface-variant max-w-xs mx-auto italic">No verification required. Extraction is immediate.</p>
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
    </div>
  );
}
