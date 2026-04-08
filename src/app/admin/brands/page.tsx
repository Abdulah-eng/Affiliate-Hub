"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Shield, 
  RefreshCcw, 
  Save, 
  Edit3, 
  Loader2,
  Trash2,
  Plus,
  X
} from "lucide-react";
import { cn } from '@/lib/utils';
import { getAllBrands, updateBrandLoginUrl, updateBrandStatus, createBrand, deleteBrand } from '@/app/actions/admin';

export default function BrandManagerPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandUrl, setNewBrandUrl] = useState("");
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    const data = await getAllBrands();
    setBrands(data);
    setLoading(false);
  };

  useEffect(() => { fetchBrands(); }, []);

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleUpdateUrl = (id: string, url: string) => {
    startTransition(async () => {
      await updateBrandLoginUrl(id, url);
      setEditingId(null);
      await fetchBrands();
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ONLINE' ? 'MAINTENANCE' : 'ONLINE';
    startTransition(async () => {
      await updateBrandStatus(id, newStatus);
      await fetchBrands();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteBrand(id);
      if (res.success) {
        showFeedback('success', 'Brand deleted successfully.');
        setDeleteConfirmId(null);
        await fetchBrands();
      } else {
        showFeedback('error', res.error || 'Failed to delete.');
      }
    });
  };

  const handleCreate = () => {
    if (!newBrandName.trim()) return;
    startTransition(async () => {
      const res = await createBrand(newBrandName.trim(), newBrandUrl.trim());
      if (res.success) {
        showFeedback('success', `Brand "${newBrandName}" added successfully.`);
        setShowAddModal(false);
        setNewBrandName("");
        setNewBrandUrl("");
        await fetchBrands();
      } else {
        showFeedback('error', res.error || 'Failed to create.');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-vapor">
      {/* Feedback Toast */}
      {feedback && (
        <div className={cn(
          "fixed top-6 right-6 z-50 px-6 py-3 rounded-xl font-bold text-sm shadow-lg animate-vapor",
          feedback.type === 'success' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
        )}>
          {feedback.msg}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <GlassCard className="p-8 max-w-sm w-full mx-4 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <Trash2 className="text-red-400" size={24} />
            </div>
            <h3 className="text-xl font-black text-on-surface">Delete Brand?</h3>
            <p className="text-on-surface-variant text-sm">This will permanently delete the brand and all associated platform access records. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} disabled={isPending} className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-bold hover:bg-red-500/30 transition-all">
                {isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Delete"}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <GlassCard className="p-8 max-w-md w-full mx-4 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-on-surface">Add New Brand</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-full hover:bg-white/5 transition-all text-on-surface-variant">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Brand Name *</label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. BIGWIN"
                  className="w-full bg-surface-container border border-outline-variant/30 text-on-surface px-4 py-3 rounded-xl outline-none focus:border-primary/50 transition-all font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Login URL</label>
                <input
                  type="text"
                  value={newBrandUrl}
                  onChange={(e) => setNewBrandUrl(e.target.value)}
                  placeholder="e.g. bigwin-partner.ph/login"
                  className="w-full bg-surface-container border border-outline-variant/30 text-on-surface px-4 py-3 rounded-xl outline-none focus:border-primary/50 transition-all font-mono"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={handleCreate} disabled={isPending || !newBrandName.trim()} className="flex-1 py-3 rounded-xl bg-primary/20 border border-primary/30 text-primary font-bold hover:bg-primary/30 transition-all disabled:opacity-50">
                {isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Add Brand"}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface">
            Brand Login <span className="text-primary">Manager</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg font-medium">
            Centralized gateway control for partner platforms. Update authentication endpoints and monitor infrastructure status in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBrands}
            className="flex items-center gap-2 px-6 py-4 bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-full hover:bg-surface-bright transition-all active:scale-95 font-bold uppercase tracking-widest text-xs"
          >
            <RefreshCcw size={16} className={cn("transition-transform", isPending && "animate-spin")} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-4 bg-primary/20 border border-primary/30 text-primary rounded-full hover:bg-primary/30 transition-all active:scale-95 font-bold uppercase tracking-widest text-xs"
          >
            <Plus size={16} />
            Add Site
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <GlassCard className="p-6 flex flex-col bg-surface-container-low/40">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1 ml-1">Total Brands</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-primary font-headline tracking-tighter">{brands.length.toString().padStart(2, '0')}</span>
            <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">Active Platforms</span>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex flex-col bg-surface-container-low/40">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1 ml-1">System Status</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></div>
            <span className="text-2xl font-black text-on-surface font-headline tracking-tight uppercase">Optimal</span>
          </div>
        </GlassCard>
      </div>

      {/* Brand Table */}
      <GlassCard className="rounded-2xl p-0 overflow-hidden mb-12 border-primary/5 bg-surface-container-low/20">
        <div className="p-8 border-b border-outline-variant/10 bg-white/5 flex justify-between items-center">
          <h2 className="font-headline font-black text-2xl flex items-center gap-3 text-on-surface uppercase tracking-tight">
            <Shield className="text-primary" size={24} />
            Brand Gateways
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Partner Brand</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Gateway URL</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Status</th>
                <th className="px-8 py-5 text-right pr-8 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {brands.map((brand) => (
                <tr key={brand.id} className="group hover:bg-white/5 transition-colors duration-500">
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center border border-primary/10 group-hover:border-primary/30 transition-all">
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="w-9 h-9 object-contain" />
                        ) : (
                          <div className="text-2xl font-black text-primary/40">{brand.name[0]}</div>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-on-surface font-headline tracking-tight text-lg">{brand.name}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{brand.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-3 max-w-sm">
                      {editingId === brand.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            className="flex-1 bg-slate-900 border border-primary/50 text-sm py-2 px-3 rounded-lg text-primary font-mono outline-none"
                            type="text"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                          />
                          <button onClick={() => handleUpdateUrl(brand.id, editUrl)} disabled={isPending} className="bg-primary text-background p-2 rounded-lg hover:scale-105 transition-all">
                            <Save size={16} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="bg-surface-container p-2 rounded-lg hover:scale-105 transition-all text-on-surface-variant">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 relative cursor-pointer" onClick={() => { setEditingId(brand.id); setEditUrl(brand.loginUrl || ""); }}>
                          <input readOnly className="w-full bg-surface-container-highest/20 border border-outline-variant/30 text-sm py-3 px-4 rounded-xl text-primary font-mono transition-all hover:border-primary/20 outline-none cursor-pointer" type="text" value={brand.loginUrl || "Not Configured"} />
                          <Edit3 className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <button
                      onClick={() => handleToggleStatus(brand.id, brand.status)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-full border w-fit font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105",
                        brand.status === 'ONLINE'
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-tertiary/10 text-tertiary border-tertiary/20"
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full", brand.status === 'ONLINE' ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-tertiary")}></span>
                      {brand.status}
                    </button>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditingId(brand.id); setEditUrl(brand.loginUrl || ""); }}
                        className="px-5 py-2.5 bg-primary/5 hover:bg-primary text-primary hover:text-background border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                      >
                        Configure
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(brand.id)}
                        className="p-2.5 bg-red-500/5 hover:bg-red-500/20 text-red-400/50 hover:text-red-400 border border-red-500/10 hover:border-red-500/30 rounded-full transition-all active:scale-95"
                        title="Delete brand"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
