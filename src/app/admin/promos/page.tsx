"use client";
import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
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
  EyeOff,
  Check,
  Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  adminCreatePromo, 
  adminUpdatePromo,
  adminDeletePromo, 
  getPromos,
  uploadPromoImage 
} from "@/app/actions/promos";

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    externalLink: "",
    active: true,
    requiresVerification: false,
    pointsAward: 0
  });
  const [promoFile, setPromoFile] = useState<File | null>(null);
  const [promoPreview, setPromoPreview] = useState<string | null>(null);

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
      let finalImageUrl = form.imageUrl;

      if (promoFile) {
        const formData = new FormData();
        formData.append("file", promoFile);
        const uploadRes = await uploadPromoImage(formData);
        if (uploadRes.success) {
          finalImageUrl = uploadRes.url || "";
        } else {
          alert("Failed to upload image: " + uploadRes.error);
          return;
        }
      }

      let res;
      if (editingId) {
        res = await adminUpdatePromo(editingId, { ...form, imageUrl: finalImageUrl });
      } else {
        res = await adminCreatePromo({ ...form, imageUrl: finalImageUrl });
      }

      if (res.success) {
        setShowAddModal(false);
        setEditingId(null);
        setForm({
          title: "",
          description: "",
          imageUrl: "",
          externalLink: "",
          active: true,
          requiresVerification: false,
          pointsAward: 0
        });
        setPromoFile(null);
        setPromoPreview(null);
        fetchPromos();
      } else {
        alert("Operation failed: " + res.error);
      }
    });
  };

  const handleEdit = (promo: any) => {
    setForm({
      title: promo.title,
      description: promo.description || "",
      imageUrl: promo.imageUrl || "",
      externalLink: promo.externalLink || "",
      active: promo.active,
      requiresVerification: promo.requiresVerification,
      pointsAward: promo.pointsAward
    });
    setEditingId(promo.id);
    setPromoFile(null);
    setPromoPreview(null);
    setShowAddModal(true);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      imageUrl: "",
      externalLink: "",
      active: true,
      requiresVerification: false,
      pointsAward: 0
    });
    setPromoFile(null);
    setPromoPreview(null);
    setShowAddModal(true);
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
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/promos/submissions"
            className="px-6 py-4 bg-surface-container-high text-on-surface hover:text-primary border border-outline-variant/30 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
          >
            <Eye size={18} /> Review Submissions
          </Link>
          <button 
            onClick={handleOpenAdd}
            className="px-6 py-4 bg-primary text-background rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
          >
            <Plus size={18} /> New Campaign
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <GlassCard className="w-full max-w-lg p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black font-headline text-on-surface uppercase tracking-tight">{editingId ? "Edit Campaign" : "Broadcast Initialization"}</h2>
            
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
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-1 block">Social Task Redirect Link (Optional)</label>
                <input 
                  className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface outline-none focus:border-primary transition-all font-mono text-sm"
                  value={form.externalLink}
                  onChange={e => setForm({...form, externalLink: e.target.value})}
                  placeholder="https://facebook.com/reel/..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-1 block">Poster Image URL</label>
                    <input 
                      className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface outline-none focus:border-primary transition-all font-mono text-sm"
                      value={form.imageUrl}
                      onChange={e => setForm({...form, imageUrl: e.target.value})}
                      placeholder="https://imgur.com/..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-1 block">Or Direct Upload</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPromoFile(file);
                            setPromoPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full bg-slate-950/50 border border-dashed border-white/20 p-4 rounded-xl text-on-surface-variant group-hover:border-primary/50 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase">
                        {promoFile ? <span className="text-primary truncate">{promoFile.name}</span> : <><ImageIcon size={16} /> Select File</>}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="aspect-video rounded-xl bg-slate-950/50 border border-white/5 overflow-hidden flex items-center justify-center relative">
                  {(promoPreview || form.imageUrl) ? (
                    <img src={promoPreview || form.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon size={32} className="opacity-10" />
                  )}
                  <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest text-primary">Preview</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-1 block">Points Award</label>
                  <input 
                    type="number"
                    className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface outline-none focus:border-primary transition-all"
                    value={form.pointsAward}
                    onChange={e => setForm({...form, pointsAward: parseInt(e.target.value)})}
                  />
                </div>
                <div 
                  className="flex items-center gap-3 cursor-pointer p-4 bg-slate-950/50 border border-white/10 rounded-xl"
                  onClick={() => setForm({...form, requiresVerification: !form.requiresVerification})}
                >
                  <div className={cn("w-6 h-6 rounded border-2 flex items-center justify-center transition-all", form.requiresVerification ? "bg-primary border-primary" : "border-white/10")}>
                    {form.requiresVerification && <Check size={14} className="text-slate-950" />}
                  </div>
                  <span className="text-xs font-bold text-on-surface">Screen Verification Required?</span>
                </div>
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
                {isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : editingId ? "Update Propaganda" : "Deploy Propaganda"}
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
                 <img src={promo.imageUrl} alt="" className="w-full h-full object-contain" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-primary/10">
                   <Megaphone size={64} />
                 </div>
               )}
               <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => handleEdit(promo)}
                    className="p-2 bg-primary/20 text-primary hover:bg-primary hover:text-white rounded-lg transition-all backdrop-blur-md"
                  >
                    <Settings2 size={16} />
                  </button>
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
