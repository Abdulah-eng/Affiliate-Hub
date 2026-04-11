"use client";

import React, { useState, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  ShieldCheck, 
  Trash2, 
  Plus, 
  Search, 
  Globe, 
  User, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addToWhitelist, removeFromWhitelist } from "@/app/actions/whitelist";

type Entry = {
  id: string;
  type: string;
  value: string;
  reason: string | null;
  addedBy: string;
  createdAt: string;
};

export default function WhitelistClient({ initialEntries }: { initialEntries: any[] }) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ type: "IP" as const, value: "", reason: "" });
  const [error, setError] = useState<string | null>(null);

  const filteredEntries = entries.filter(e => 
    e.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.reason && e.reason.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!newEntry.value) return;
    setError(null);
    const res = await addToWhitelist(newEntry);
    if (res.success) {
      setShowAddModal(false);
      setNewEntry({ type: "IP", value: "", reason: "" });
      // Refresh list (assuming it's small or we just manual update)
      const { getWhitelist } = await import("@/app/actions/whitelist");
      const updated = await getWhitelist();
      setEntries(updated as any);
    } else {
      setError(res.error || "Failed to add.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this entry?")) return;
    const res = await removeFromWhitelist(id);
    if (res.success) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div className="animate-vapor space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black font-headline text-on-surface uppercase italic">Whitelist <span className="text-primary not-italic tracking-normal">Nexus</span></h1>
          <p className="text-on-surface-variant mt-2 font-medium">Bypass algorithmic suppression for trusted network nodes and IP ranges.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input 
              className="w-full bg-surface-container-low border border-white/5 p-4 pl-12 rounded-2xl outline-none text-on-surface text-sm"
              placeholder="Filter nodes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-8 py-4 bg-primary text-background rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:shadow-[0_0_30px_rgba(129,236,255,0.4)] transition-all"
          >
            <Plus size={18} /> New Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredEntries.map((entry) => (
          <GlassCard key={entry.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-white/5 hover:border-primary/20 transition-all group">
            <div className="flex items-center gap-5">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center border",
                entry.type === 'IP' ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-tertiary/10 text-tertiary border-tertiary/20"
              )}>
                {entry.type === 'IP' ? <Globe size={20} /> : <User size={20} />}
              </div>
              <div>
                <p className="font-mono text-lg font-black text-on-surface">{entry.value}</p>
                <div className="flex items-center gap-3 mt-1">
                   <span className="text-[9px] font-black uppercase text-primary tracking-widest">{entry.type} NODE</span>
                   <span className="text-[9px] text-on-surface-variant font-bold uppercase opacity-40">• ADDED BY {entry.addedBy}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-md">
               <p className="text-xs text-on-surface-variant font-medium italic opacity-60">" {entry.reason || "System-wide strategic whitelist approval."} "</p>
            </div>

            <button 
              onClick={() => handleDelete(entry.id)}
              className="p-4 rounded-xl hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 transition-all md:opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={20} />
            </button>
          </GlassCard>
        ))}

        {filteredEntries.length === 0 && (
          <div className="py-20 text-center opacity-20">
             <ShieldCheck size={64} className="mx-auto mb-4" />
             <p className="font-black uppercase tracking-[0.4em]">Grid Empty</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
           <GlassCard className="max-w-md w-full p-8 space-y-8 animate-vapor">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black font-headline text-on-surface uppercase tracking-tight">Manual Whitelisting</h2>
                 <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-white transition-colors">
                    <Plus size={24} className="rotate-45" />
                 </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold">
                   <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">Node Type</label>
                    <div className="flex gap-4">
                       {["IP", "USERNAME"].map(t => (
                         <button 
                           key={t}
                           onClick={() => setNewEntry(prev => ({ ...prev, type: t as any }))}
                           className={cn(
                             "flex-1 py-3 rounded-xl font-bold text-xs border transition-all",
                             newEntry.type === t ? "bg-primary text-background border-primary" : "bg-white/5 border-white/10 text-on-surface-variant"
                           )}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">Node Value</label>
                    <input 
                      className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl outline-none text-on-surface font-mono"
                      placeholder={newEntry.type === 'IP' ? "0.0.0.0" : "Username"}
                      value={newEntry.value}
                      onChange={e => setNewEntry(prev => ({ ...prev, value: e.target.value }))}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">Strategic Reason</label>
                    <textarea 
                      className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl outline-none text-on-surface text-sm min-h-[100px]"
                      placeholder="Why is this node being authorized?"
                      value={newEntry.reason}
                      onChange={e => setNewEntry(prev => ({ ...prev, reason: e.target.value }))}
                    />
                 </div>

                 <button 
                   onClick={handleAdd}
                   className="w-full py-5 bg-primary text-background rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(129,236,255,0.4)] transition-all"
                 >
                   Authorize Node
                 </button>
              </div>
           </GlassCard>
        </div>
      )}
    </div>
  );
}
