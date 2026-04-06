"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Shield, 
  RefreshCcw, 
  Save, 
  Search, 
  Edit3, 
  History, 
  Link as LinkIcon,
  RotateCcw,
  Activity,
  ChevronDown,
  Loader2
} from "lucide-react";
import { cn } from '@/lib/utils';
import { getAllBrands, updateBrandLoginUrl, updateBrandStatus } from '@/app/actions/admin';

export default function BrandManagerPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");

  const fetchBrands = async () => {
    setLoading(true);
    const data = await getAllBrands();
    setBrands(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-vapor">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface">
            Brand Login <span className="text-primary">Manager</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg font-medium">
            Centralized gateway control for partner platforms. Update authentication endpoints and monitor infrastructure status in real-time.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchBrands}
            className="flex items-center gap-2 px-6 py-4 bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-full hover:bg-surface-bright transition-all active:scale-95 font-bold uppercase tracking-widest text-xs group"
          >
            <RefreshCcw size={16} className={cn("transition-transform duration-500", isPending && "animate-spin")} />
            Refresh Nodes
          </button>
        </div>
      </div>

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

      {/* Brand Manager Table */}
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
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Gateway URL Configuration</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Health Status</th>
                <th className="px-8 py-5 text-right pr-8 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {brands.map((brand) => (
                <tr key={brand.id} className="group hover:bg-white/5 transition-colors duration-500">
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-5">
                      <div className="relative w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center border border-primary/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:border-primary/30 transition-all">
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
                          <button 
                            onClick={() => handleUpdateUrl(brand.id, editUrl)}
                            disabled={isPending}
                            className="bg-primary text-background p-2 rounded-lg hover:scale-105 transition-all"
                          >
                            <Save size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 relative group/input cursor-pointer" onClick={() => { setEditingId(brand.id); setEditUrl(brand.loginUrl || ""); }}>
                          <input 
                            readOnly
                            className="w-full bg-surface-container-highest/20 border border-outline-variant/30 text-sm py-3 px-4 rounded-xl text-primary font-mono transition-all group-hover/input:border-primary/20 outline-none cursor-pointer" 
                            type="text" 
                            value={brand.loginUrl || "Not Configured"} 
                          />
                          <Edit3 className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm" size={16} />
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
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        brand.status === 'ONLINE' ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-tertiary shadow-[0_0_8px_#a68cff]"
                      )}></span>
                      {brand.status}
                    </button>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <button 
                      onClick={() => { setEditingId(brand.id); setEditUrl(brand.loginUrl || ""); }}
                      className="px-6 py-2.5 bg-primary/5 hover:bg-primary text-primary hover:text-background border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                      Configure
                    </button>
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
