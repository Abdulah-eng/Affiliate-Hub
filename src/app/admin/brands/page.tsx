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
  X,
  Image as ImageIcon,
  Layout,
  Globe,
  Check
} from "lucide-react";
import { cn, getImageSrc } from '@/lib/utils';
import { 
  getAllBrands, 
  updateBrand, 
  createBrand, 
  deleteBrand,
  uploadBrandLogo 
} from '@/app/actions/admin';

export default function PlatformManagerPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBrandForm, setNewBrandForm] = useState({ name: "", loginUrl: "", playerLoginUrl: "", logoUrl: "" });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  
  // File states for Add
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addPreview, setAddPreview] = useState<string | null>(null);
  
  // File states for Edit
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);

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

  const handleUpdate = (id: string, data: any) => {
    startTransition(async () => {
      let finalLogoUrl = data.logoUrl;

      if (editFile) {
        const formData = new FormData();
        formData.append("file", editFile);
        const uploadRes = await uploadBrandLogo(formData);
        if (uploadRes.success) {
          finalLogoUrl = uploadRes.url || "";
        } else {
          showFeedback('error', 'Logo upload failed: ' + uploadRes.error);
          return;
        }
      }

      // Explicitly pick allowed fields to avoid Prisma errors with extra fields
      const updateData = {
        name: data.name,
        loginUrl: data.loginUrl,
        playerLoginUrl: data.playerLoginUrl,
        logoUrl: finalLogoUrl,
        description: data.description,
        status: data.status,
        useIframe: data.useIframe,
        isActive: data.isActive
      };

      const res = await updateBrand(id, updateData);
      if (res.success) {
        showFeedback('success', 'Platform configuration synced.');
        setEditingBrand(null);
        setEditFile(null);
        setEditPreview(null);
        await fetchBrands();
      } else {
        showFeedback('error', res.error || 'Update failed.');
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteBrand(id);
      if (res.success) {
        showFeedback('success', 'Platform deleted.');
        setDeleteConfirmId(null);
        await fetchBrands();
      } else {
        showFeedback('error', res.error || 'Delete failed.');
      }
    });
  };

  const handleCreate = () => {
    if (!newBrandForm.name.trim()) return;
    startTransition(async () => {
      let finalLogoUrl = newBrandForm.logoUrl;

      if (addFile) {
        const formData = new FormData();
        formData.append("file", addFile);
        const uploadRes = await uploadBrandLogo(formData);
        if (uploadRes.success) {
          finalLogoUrl = uploadRes.url || "";
        } else {
          showFeedback('error', 'Logo upload failed: ' + uploadRes.error);
          return;
        }
      }

      const res = await createBrand(newBrandForm.name, newBrandForm.loginUrl, finalLogoUrl, newBrandForm.playerLoginUrl);
      if (res.success) {
        showFeedback('success', `Platform added.`);
        setShowAddModal(false);
        setNewBrandForm({ name: "", loginUrl: "", playerLoginUrl: "", logoUrl: "" });
        setAddFile(null);
        setAddPreview(null);
        await fetchBrands();
      } else {
        showFeedback('error', res.error || 'Failed to create.');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex bg-background items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-vapor max-w-7xl mx-auto pb-20">
      {/* Feedback Toast */}
      {feedback && (
        <div className={cn(
          "fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl font-bold text-sm shadow-lg animate-vapor",
          feedback.type === 'success' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
        )}>
          {feedback.msg}
        </div>
      )}

      {/* Edit Modal */}
      {editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
          <GlassCard className="p-4 sm:p-8 max-w-2xl w-full space-y-6 my-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black font-headline text-on-surface uppercase tracking-tight">Configure Gateway</h3>
              <button onClick={() => setEditingBrand(null)} className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] ml-1">Platform Name</label>
                 <input 
                   className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface outline-none focus:border-primary transition-all"
                   value={editingBrand.name}
                   onChange={e => setEditingBrand({...editingBrand, name: e.target.value})}
                 />
               </div>
               <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] ml-1">Partner Login URL</label>
                   <input 
                     className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-primary font-mono text-sm outline-none focus:border-primary transition-all"
                     value={editingBrand.loginUrl || ""}
                     onChange={e => setEditingBrand({...editingBrand, loginUrl: e.target.value})}
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.2em] ml-1">Player Login URL</label>
                   <input 
                     className="w-full bg-slate-950/50 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 font-mono text-sm outline-none focus:border-emerald-500 transition-all"
                     value={editingBrand.playerLoginUrl || ""}
                     onChange={e => setEditingBrand({...editingBrand, playerLoginUrl: e.target.value})}
                     placeholder="Direct Play URL..."
                   />
                 </div>
               </div>
               <div className="space-y-2 md:col-span-2">
                 <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] ml-1">Platform Branding (URL or Upload)</label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <input 
                        className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface text-sm outline-none focus:border-primary transition-all"
                        value={editingBrand.logoUrl || ""}
                        onChange={e => setEditingBrand({...editingBrand, logoUrl: e.target.value})}
                        placeholder="External Logo URL..."
                      />
                      <div className="relative group">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setEditFile(file);
                              setEditPreview(URL.createObjectURL(file));
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full bg-slate-950/50 border border-dashed border-white/20 p-4 rounded-xl text-on-surface-variant group-hover:border-primary/50 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase">
                          {editFile ? <span className="text-primary truncate">{editFile.name}</span> : <><ImageIcon size={16} /> Upload Logo</>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="aspect-square rounded-xl bg-slate-950/50 border border-white/5 overflow-hidden flex items-center justify-center relative p-4">
                      {(editPreview || editingBrand.logoUrl) ? (
                        <img 
                          src={getImageSrc(editPreview || editingBrand.logoUrl)} 
                          alt="Preview" 
                          className="w-full h-full object-contain" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-logo.png";
                          }}
                        />
                      ) : (
                        <ImageIcon size={32} className="opacity-10" />
                      )}
                      <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest text-primary">Preview</div>
                    </div>
                 </div>
               </div>
               <div className="space-y-2 md:col-span-2">
                 <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] ml-1">Description / Intel</label>
                 <textarea 
                   className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-on-surface text-sm outline-none focus:border-primary transition-all h-24"
                   value={editingBrand.description || ""}
                   onChange={e => setEditingBrand({...editingBrand, description: e.target.value})}
                 />
               </div>

               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-on-surface uppercase">Iframe Access</p>
                    <p className="text-[10px] text-on-surface-variant font-bold">Open site inside the vault</p>
                  </div>
                  <button 
                    onClick={() => setEditingBrand({...editingBrand, useIframe: !editingBrand.useIframe})}
                    className={cn("w-12 h-6 rounded-full transition-all relative", editingBrand.useIframe ? "bg-primary" : "bg-white/10")}
                  >
                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", editingBrand.useIframe ? "left-7" : "left-1")} />
                  </button>
               </div>

               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-on-surface uppercase">Public Visibility</p>
                    <p className="text-[10px] text-on-surface-variant font-bold">Show in application forms</p>
                  </div>
                  <button 
                    onClick={() => setEditingBrand({...editingBrand, isActive: !editingBrand.isActive})}
                    className={cn("w-12 h-6 rounded-full transition-all relative", editingBrand.isActive ? "bg-emerald-500" : "bg-red-500/40")}
                  >
                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", editingBrand.isActive ? "left-7" : "left-1")} />
                  </button>
               </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setEditingBrand(null)} 
                className="flex-1 py-4 rounded-xl border border-white/10 text-on-surface-variant font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleUpdate(editingBrand.id, editingBrand)} 
                disabled={isPending} 
                className="flex-1 py-4 bg-primary text-background rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Save Changes"}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <GlassCard className="p-8 max-w-sm w-full mx-4 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <Trash2 className="text-red-400" size={24} />
            </div>
            <h3 className="text-xl font-black text-on-surface">Delete Platform?</h3>
            <p className="text-on-surface-variant text-sm">This will permanently delete the platform and all associated access records. This cannot be undone.</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <GlassCard className="p-4 sm:p-8 max-w-md w-full mx-auto space-y-5 my-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Expand Network</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-full hover:bg-white/5 transition-all text-on-surface-variant">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1 block">Platform Name *</label>
                  <input
                    type="text"
                    value={newBrandForm.name}
                    onChange={(e) => setNewBrandForm({...newBrandForm, name: e.target.value})}
                    placeholder="e.g. OKBET"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface px-4 py-3 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1 block">Login URL</label>
                    <input
                      type="text"
                      value={newBrandForm.loginUrl}
                      onChange={(e) => setNewBrandForm({...newBrandForm, loginUrl: e.target.value})}
                      placeholder="partner.ph/login"
                      className="w-full bg-surface-container border border-outline-variant/30 text-on-surface px-4 py-3 rounded-xl outline-none focus:border-primary transition-all text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 block">Player URL</label>
                    <input
                      type="text"
                      value={newBrandForm.playerLoginUrl}
                      onChange={(e) => setNewBrandForm({...newBrandForm, playerLoginUrl: e.target.value})}
                      placeholder="play.ph/login"
                      className="w-full bg-surface-container border border-emerald-500/20 text-on-surface px-4 py-3 rounded-xl outline-none focus:border-emerald-500 transition-all text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Logo Configuration</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newBrandForm.logoUrl}
                    onChange={(e) => setNewBrandForm({...newBrandForm, logoUrl: e.target.value})}
                    placeholder="External URL (Optional)"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface px-4 py-3 rounded-xl outline-none focus:border-primary transition-all text-sm font-mono"
                  />
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAddFile(file);
                          setAddPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full bg-surface-container border border-dashed border-outline-variant/30 p-3 rounded-xl text-on-surface-variant group-hover:border-primary/50 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                      {addFile ? <span className="text-primary truncate">{addFile.name}</span> : <><ImageIcon size={14} /> Upload Device Asset</>}
                    </div>
                  </div>
                  {(addPreview || newBrandForm.logoUrl) && (
                    <div className="h-20 w-full bg-black/20 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center p-2">
                       <img 
                        src={getImageSrc(addPreview || newBrandForm.logoUrl || "")} 
                        className="h-full object-contain" 
                        alt="Preview" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-logo.png";
                        }}
                       />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 rounded-xl border border-outline-variant/30 text-on-surface-variant font-black uppercase tracking-widest text-[10px] transition-all opacity-60">Cancel</button>
              <button onClick={handleCreate} disabled={isPending || !newBrandForm.name.trim()} className="flex-1 py-4 bg-primary text-background rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all">
                {isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Initialize Site"}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6 pt-6 md:pt-10 px-4 md:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">KYC EDITOR v2.0</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
            Platform <span className="text-primary tracking-normal">Engineering</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg font-medium">
            Manage corporate partner credentials, branding assets, and secure infrastructure endpoints.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchBrands}
            className="flex items-center justify-center w-14 h-14 bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-2xl hover:bg-surface-bright transition-all active:scale-95"
          >
            <RefreshCcw size={20} className={cn("transition-transform", isPending && "animate-spin")} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 px-8 h-14 bg-primary text-background rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.95] transition-all shadow-xl shadow-primary/20"
          >
            <Plus size={18} /> Add New Partner
          </button>
        </div>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-8">
        {brands.map((brand) => (
          <GlassCard key={brand.id} className={cn(
            "p-8 group hover:-translate-y-2 transition-all duration-500 border-l-4",
            brand.isActive ? "border-primary" : "border-red-500/40 grayscale opacity-80"
          )}>
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                 <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-2">
                    {brand.logoUrl ? (
                      <img 
                        src={getImageSrc(brand.logoUrl)} 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-logo.png";
                        }}
                      />
                    ) : (
                      <Globe size={32} className="text-on-surface-variant/20" />
                    )}
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingBrand(brand)}
                      className="p-3 bg-white/5 hover:bg-primary hover:text-background rounded-xl text-on-surface-variant transition-all border border-white/10"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(brand.id)}
                      className="p-3 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl text-red-400 transition-all border border-red-500/10"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
              </div>

              <div className="grow">
                 <div className="flex items-center gap-3 mb-2">
                   <h3 className="text-2xl font-black text-on-surface uppercase tracking-tight">{brand.name}</h3>
                   {!brand.isActive && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black uppercase rounded">Hidden</span>}
                 </div>
                 <div className="space-y-1 mb-4">
                   <p className="font-mono text-[9px] text-primary truncate italic">Partner: {brand.loginUrl || "NO_GATEWAY"}</p>
                   {brand.playerLoginUrl && (
                     <p className="font-mono text-[9px] text-emerald-400 truncate italic">Player: {brand.playerLoginUrl}</p>
                   )}
                 </div>
                 <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed mb-6 italic opacity-60">
                    {brand.description || "No tactical intel provided for this gateway."}
                 </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                 <div className="flex gap-4">
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black uppercase text-on-surface-variant tracking-widest">Tunnel</span>
                       <span className={cn("text-[10px] font-black uppercase", brand.useIframe ? "text-primary" : "text-amber-500")}>
                          {brand.useIframe ? "IFRAME_SECURE" : "EXTERNAL_REDirect"}
                       </span>
                    </div>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black uppercase text-on-surface-variant tracking-widest">Status</span>
                       <span className={cn("text-[10px] font-black uppercase", brand.status === 'ONLINE' ? "text-emerald-500" : "text-tertiary")}>
                          {brand.status}
                       </span>
                    </div>
                 </div>
                 <button 
                  onClick={() => setEditingBrand(brand)}
                  className="p-3 text-primary hover:scale-110 transition-transform"
                 >
                    <ChevronRight />
                 </button>
              </div>
            </div>
          </GlassCard>
        ))}

        {brands.length === 0 && !loading && (
          <div className="col-span-3 py-32 text-center">
             <Shield size={64} className="mx-auto mb-6 text-on-surface-variant opacity-10" />
             <p className="font-black uppercase tracking-[0.4em] text-on-surface-variant opacity-40">Grid Exhausted</p>
             <p className="text-xs text-on-surface-variant mt-2 opacity-20 italic">No partner gateways initialized in the current sector.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronRight({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
