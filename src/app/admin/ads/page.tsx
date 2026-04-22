"use client";

import React, { useState, useEffect, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Image as ImageIcon, 
  ToggleLeft, 
  ToggleRight,
  Loader2,
  X,
  PlusCircle,
  Megaphone
} from "lucide-react";
import { getAllAds, createAd, toggleAdStatus, deleteAd } from "@/app/actions/ads";
import { cn } from "@/lib/utils";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    const data = await getAllAds();
    setAds(data);
    setLoading(false);
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await toggleAdStatus(id, !current);
      if (result.success) {
        setAds(ads.map(ad => ad.id === id ? { ...ad, isActive: !current } : ad));
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return;
    startTransition(async () => {
      const result = await deleteAd(id);
      if (result.success) {
        setAds(ads.filter(ad => ad.id !== id));
      }
    });
  };

  const [formData, setFormData] = useState({
    title: "",
    externalLink: "",
    priority: "0",
    image: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.image) {
      setError("Please select an image.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("externalLink", formData.externalLink);
    data.append("priority", formData.priority);
    data.append("image", formData.image);

    startTransition(async () => {
      const result = await createAd(data);
      if (result.success) {
        setShowAddModal(false);
        setFormData({ title: "", externalLink: "", priority: "0", image: null });
        fetchAds();
      } else {
        setError(result.error || "Failed to create ad.");
      }
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-vapor">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-headline text-on-surface tracking-tight uppercase">
            Marketing <span className="text-primary">Vault</span>
          </h1>
          <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest mt-1">
            Manage Agent Pop-up Advertisements
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-background rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={16} strokeWidth={3} /> Create New Ad
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : ads.length === 0 ? (
        <GlassCard className="p-20 text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20">
            <Megaphone size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-on-surface">No Ads Found</h3>
            <p className="text-on-surface-variant text-sm mt-2">Start by creating your first promotional pop-up.</p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ads.map((ad) => (
            <GlassCard key={ad.id} className={cn("overflow-hidden group flex flex-col", !ad.isActive && "opacity-60")}>
              <div className="aspect-[4/5] relative bg-surface-container overflow-hidden">
                <img 
                  src={ad.imageUrl} 
                  alt={ad.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Priority: {ad.priority}</span>
                      <h3 className="font-black text-on-surface text-lg leading-none uppercase">{ad.title}</h3>
                   </div>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between bg-surface-container/30 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(ad.id, ad.isActive)}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      ad.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-on-surface-variant/10 text-on-surface-variant"
                    )}
                    title={ad.isActive ? "Deactivate" : "Activate"}
                  >
                    {ad.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  {ad.externalLink && (
                    <a 
                      href={ad.externalLink} 
                      target="_blank" 
                      className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-background transition-all"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
          <GlassCard className="w-full max-w-lg p-8 space-y-8 animate-in zoom-in-95 duration-200 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary">
                <PlusCircle size={24} strokeWidth={3} />
                <h2 className="text-2xl font-black uppercase tracking-tight">Create Advertisement</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-2">Ad Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mid-Summer Rewards"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 outline-none focus:border-primary text-on-surface font-bold"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-2">External Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 outline-none focus:border-primary text-on-surface text-sm"
                  value={formData.externalLink}
                  onChange={e => setFormData({...formData, externalLink: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-2">Priority</label>
                  <input
                    type="number"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 outline-none focus:border-primary text-on-surface font-mono"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-2">Image Aspect</label>
                  <div className="w-full h-11 flex items-center justify-center bg-surface-container/30 rounded-xl border border-dashed border-outline-variant text-[9px] font-black text-on-surface-variant uppercase">
                    Recommend 4:5 ratio
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-2">Promotion Creative</label>
                <div className="relative group">
                  <input
                    required
                    type="file"
                    accept="image/*"
                    onChange={e => setFormData({...formData, image: e.target.files?.[0] || null})}
                    className="hidden"
                    id="ad-image-upload"
                  />
                  <label
                    htmlFor="ad-image-upload"
                    className="flex flex-col items-center justify-center gap-4 w-full h-40 border-2 border-dashed border-outline-variant rounded-2xl cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all group-hover:bg-primary/5"
                  >
                    {formData.image ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                          <ImageIcon size={24} />
                        </div>
                        <span className="text-[10px] font-black text-on-surface-variant uppercase truncate max-w-[200px]">
                          {formData.image.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Plus size={32} className="text-on-surface-variant/40" />
                        <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Select Visual</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-primary text-background font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-primary/20 mt-4 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="animate-spin" size={18} />}
                {isPending ? "UPLOADING..." : "DEPLOY ADVERTISEMENT"}
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
