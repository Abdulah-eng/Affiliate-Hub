"use client";

import React, { useState, useEffect, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Trophy, 
  Trash2, 
  Plus, 
  Save, 
  Loader2, 
  AlertTriangle,
  Users,
  TrendingUp,
  Coins
} from "lucide-react";
import { getLeaderboard, upsertLeaderboardEntry, deleteLeaderboardEntry } from "@/app/actions/leaderboard";
import { cn } from "@/lib/utils";

export default function AdminLeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const categories = [
    { id: "TOP_PLAYERS", name: "Top Player Sign Ups", icon: <Users size={16} /> },
    { id: "TOP_VTO", name: "Top VTO", icon: <TrendingUp size={16} /> },
    { id: "TOP_COMMISSION", name: "Top Commission", icon: <Coins size={16} /> }
  ];

  const fetchEntries = async () => {
    setLoading(true);
    const res = await getLeaderboard();
    if (res.success) setEntries(res.entries || []);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleAdd = (category: string) => {
    const nextRank = entries.filter(e => e.category === category).length + 1;
    setEntries([...entries, { 
      category, 
      rank: nextRank, 
      userId: "", 
      ggrValue: "", 
      dateRange: "", 
      isNew: true 
    }]);
  };

  const handleSave = (entry: any) => {
    startTransition(async () => {
      const res = await upsertLeaderboardEntry(entry);
      if (res.success) fetchEntries();
      else alert(res.error);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this entry?")) return;
    startTransition(async () => {
      const res = await deleteLeaderboardEntry(id);
      if (res.success) fetchEntries();
      else alert(res.error);
    });
  };

  return (
    <div className="space-y-10 animate-vapor">
      <div>
        <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
          Leaderboard <span className="text-primary tracking-normal not-italic">Manual Feed</span>
        </h1>
        <p className="text-on-surface-variant max-w-xl text-lg font-medium mt-2">
          Control the performance showcase. Data entered here appears instantly on the Agent side.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {categories.map(cat => (
          <GlassCard key={cat.id} className="p-0 overflow-hidden border-primary/10">
            <div className="p-8 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">{cat.name}</h3>
              </div>
              <button 
                onClick={() => handleAdd(cat.id)}
                className="px-6 py-3 bg-primary/10 hover:bg-primary text-primary hover:text-background rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border border-primary/20"
              >
                <Plus size={14} /> Add Operative
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-high/30">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest w-20">Rank</th>
                    <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Username / User ID</th>
                    <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">GGR</th>
                    <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Date (Range)</th>
                    <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {entries.filter(e => e.category === cat.id).map((entry, idx) => (
                    <tr key={entry.id || idx} className="hover:bg-surface-container-high/20 transition-colors">
                      <td className="px-8 py-4">
                        <input 
                          type="number" 
                          value={entry.rank}
                          onChange={(e) => {
                            const newEntries = [...entries];
                            const foundIdx = entries.indexOf(entry);
                            newEntries[foundIdx].rank = parseInt(e.target.value);
                            setEntries(newEntries);
                          }}
                          className="bg-surface-container-highest/50 border border-outline-variant/10 rounded-lg px-3 py-1.5 text-xs font-black text-primary w-16"
                        />
                      </td>
                      <td className="px-8 py-4">
                        <input 
                          type="text" 
                          placeholder="WFLAF146"
                          value={entry.userId}
                          onChange={(e) => {
                            const newEntries = [...entries];
                            const foundIdx = entries.indexOf(entry);
                            newEntries[foundIdx].userId = e.target.value;
                            setEntries(newEntries);
                          }}
                          className="bg-surface-container-highest/50 border border-outline-variant/10 rounded-lg px-3 py-1.5 text-xs font-bold w-full max-w-[200px]"
                        />
                      </td>
                      <td className="px-8 py-4">
                        <input 
                          type="text" 
                          placeholder="(-65,657)"
                          value={entry.ggrValue}
                          onChange={(e) => {
                            const newEntries = [...entries];
                            const foundIdx = entries.indexOf(entry);
                            newEntries[foundIdx].ggrValue = e.target.value;
                            setEntries(newEntries);
                          }}
                          className="bg-surface-container-highest/50 border border-outline-variant/10 rounded-lg px-3 py-1.5 text-xs font-bold w-full max-w-[150px]"
                        />
                      </td>
                      <td className="px-8 py-4">
                        <input 
                          type="text" 
                          placeholder="JAN 19 - JAN 25"
                          value={entry.dateRange}
                          onChange={(e) => {
                            const newEntries = [...entries];
                            const foundIdx = entries.indexOf(entry);
                            newEntries[foundIdx].dateRange = e.target.value;
                            setEntries(newEntries);
                          }}
                          className="bg-surface-container-highest/50 border border-outline-variant/10 rounded-lg px-3 py-1.5 text-xs font-bold w-full max-w-[150px]"
                        />
                      </td>
                      <td className="px-8 py-4 text-right flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleSave(entry)}
                          className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-background transition-all"
                        >
                          <Save size={18} />
                        </button>
                        {entry.id && (
                          <button 
                            onClick={() => handleDelete(entry.id)}
                            className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-background transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
