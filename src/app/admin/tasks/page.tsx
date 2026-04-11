"use client";

import React, { useState, useEffect, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Video, 
  Trash2, 
  Plus, 
  Loader2, 
  ExternalLink,
  ChevronRight,
  Save,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminCreateTask, adminDeleteTask, getTasks } from "@/app/actions/tasks";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    points: 100,
    videoUrl: "",
    isExternal: false,
    type: "VIDEO"
  });

  const fetchTasks = async () => {
    setLoading(true);
    const res = await getTasks();
    if (Array.isArray(res)) {
       setTasks(res);
    } else if (res && res.items) {
       setTasks(res.items);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure?")) return;
    startTransition(async () => {
      await adminDeleteTask(id);
      fetchTasks();
    });
  };

  const handleCreate = () => {
    if (!form.title) return;
    startTransition(async () => {
      await adminCreateTask(form);
      setShowAddModal(false);
      setForm({
        title: "",
        description: "",
        points: 100,
        videoUrl: "",
        isExternal: false,
        type: "VIDEO"
      });
      fetchTasks();
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-vapor max-w-6xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
            Quest <span className="text-primary tracking-normal">Architect</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-4">
            Design and deploy video reward tasks for your agent network.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-6 py-4 bg-primary text-background rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
        >
          <Plus size={18} /> Build New Task
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <GlassCard className="w-full max-w-lg p-8 space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
            <h2 className="text-2xl font-black font-headline text-on-surface uppercase tracking-tight">New Quest Protocol</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-1 block">Task Title</label>
                <input 
                  className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface outline-none focus:border-primary transition-all"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g. Watch Product Demo"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-1 block">Description</label>
                <textarea 
                  className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface outline-none focus:border-primary transition-all h-24"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="What should they learn?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-1 block">Point Award</label>
                  <input 
                    type="number"
                    className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface outline-none focus:border-primary transition-all"
                    value={form.points}
                    onChange={e => setForm({...form, points: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-1 block">Task Type</label>
                  <select 
                    className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface outline-none focus:border-primary transition-all"
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                  >
                    <option value="VIDEO">Video Reward</option>
                    <option value="SOCIAL">Social Action</option>
                    <option value="FEEDBACK">Feedback Form</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-1 block">Video / Source URL</label>
                <input 
                  className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface outline-none focus:border-primary transition-all font-mono text-sm"
                  value={form.videoUrl}
                  onChange={e => setForm({...form, videoUrl: e.target.value})}
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div 
                className="flex items-center gap-3 cursor-pointer p-2"
                onClick={() => setForm({...form, isExternal: !form.isExternal})}
              >
                <div className={cn("w-6 h-6 rounded border-2 flex items-center justify-center transition-all", form.isExternal ? "bg-primary border-primary" : "border-white/10")}>
                  {form.isExternal && <ChevronRight size={14} className="text-slate-950" />}
                </div>
                <span className="text-xs font-bold text-on-surface">External Redirect Task?</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 border border-white/10 rounded-xl font-bold text-on-surface-variant hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
              >
                Abondon
              </button>
              <button 
                onClick={handleCreate}
                disabled={isPending || !form.title}
                className="flex-1 py-4 bg-primary text-background rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Deploy Quest"}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      <div className="grid gap-6">
        {tasks.map(task => (
          <GlassCard key={task.id} className="p-8 group hover:border-primary/30 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Video size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">{task.title}</h3>
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[8px] font-black uppercase text-on-surface-variant rounded">{task.type}</span>
                  </div>
                  <p className="text-on-surface-variant text-sm mt-1 max-w-xl">{task.description}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <p className="text-xs font-mono text-primary font-black uppercase tracking-widest">
                      Award: {task.points} PTS
                    </p>
                    <div className="w-1 h-1 bg-white/20 rounded-full" />
                    <p className="text-[10px] text-on-surface-variant font-bold truncate max-w-xs opacity-60">
                      {task.videoUrl}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(task.id)}
                className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-slate-950 rounded-xl transition-all border border-red-500/20"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </GlassCard>
        ))}

        {tasks.length === 0 && !loading && (
          <GlassCard className="p-20 flex flex-col items-center justify-center text-on-surface-variant/20 border-dashed">
            <Video size={64} className="mb-4 opacity-10" />
            <p className="font-black uppercase tracking-[0.3em]">No Active Quests</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
