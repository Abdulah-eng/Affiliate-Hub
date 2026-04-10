"use client";

import React, { useState, useEffect, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  MonitorPlay, 
  Trash2, 
  Plus, 
  Loader2, 
  Image as ImageIcon,
  Save,
  X,
  Megaphone,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminCreatePromo, adminDeletePromo, getPromos } from "@/app/actions/promos";

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    active: true
  });

  const fetchPromos = async () => {
    setLoading(true);
    const data = await getPromos();
    setPromos(data);
    setLoading(false);
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure?")) return;
    startTransition(async () => {
      await adminDeletePromo(id);
      fetchPromos();
    });
  };

  const handleCreate = () => {
    if (!form.title) return;
    startTransition(async () => {
      await adminCreatePromo(form);
      setShowAddModal(false);
      setForm({
        title: "",
        description: "",
        imageUrl: "",
        active: true
      });
      fetchPromos();
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
            Promo <span className="text-primary tracking-normal">Propaganda</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-4">
            Broadcast promotional posters and seasonal campaigns to the agent dashboard.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-6 py-4 bg-primary text-background rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
        >
          <Plus size={18} /> New Campaign
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <GlassCard className="w-full max-w-lg p-8 space-y-6">
            <h2 className="text-2xl font-black font-headline text-on-surface uppercase tracking-tight">Broadcast Initialization</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-1 block">Campaign Title</label>
                <input 
                  className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface outline-none focus:border-primary transition-all"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g. 2x Points Weekend"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-1 block">Poster Instructions (Instruction from Admin)</label>
                <textarea 
                  className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface outline-none focus:border-primary transition-all h-24"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="How can they participate?"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-1 block">Poster Image URL</label>
                <input 
                  className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface outline-none focus:border-primary transition-all font-mono text-sm"
                  value={form.imageUrl}
                  onChange={e => setForm({...form, imageUrl: e.target.value})}
                  placeholder="https://imgur.com/..."
                />
              </div>
              <div 
                className="flex items-center gap-3 cursor-pointer p-2"
                onClick={() => setForm({...form, active: !form.active})}
              >
                <div className={cn("w-6 h-6 rounded border-2 flex items-center justify-center transition-all", form.active ? "bg-primary border-primary" : "border-white/10")}>
                  {form.active && <Save size={14} className="text-slate-950" />}
                </div>
                <span className="text-xs font-bold text-on-surface">Activate immediately?</span>
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
                {isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Deploy Propaganda"}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {promos.map(promo => (
          <GlassCard key={promo.id} className="group overflow-hidden relative">
            <div className="aspect-video bg-black relative">
               {promo.imageUrl ? (
                 <img src={promo.imageUrl} alt="" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-primary/10">
                   <Megaphone size={64} />
                 </div>
               )}
               <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => handleDelete(promo.id)}
                    className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all backdrop-blur-md"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
            </div>
            <div className="p-6">
               <div className="flex items-center gap-2 mb-2">
                 <h3 className="text-lg font-black text-on-surface uppercase tracking-tight">{promo.title}</h3>
                 <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest", promo.active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500")}>
                   {promo.active ? "Active" : "Disabled"}
                 </span>
               </div>
               <p className="text-xs text-on-surface-variant line-clamp-2 italic opacity-60 mb-4">{promo.description}</p>
            </div>
          </GlassCard>
        ))}

        {promos.length === 0 && !loading && (
          <GlassCard className="col-span-3 p-20 flex flex-col items-center justify-center text-on-surface-variant/20 border-dashed">
            <Megaphone size={64} className="mb-4 opacity-10" />
            <p className="font-black uppercase tracking-[0.3em]">No Active Campaigns</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
