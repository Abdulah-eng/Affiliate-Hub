"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Dices, 
  Save, 
  RefreshCcw, 
  Loader2, 
  Trophy, 
  Settings2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSystemSettings, updateSystemSettings } from "@/app/actions/admin";

export default function RaffleSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    const data = await getSystemSettings();
    const map: Record<string, string> = {};
    data.forEach(s => {
      if (s.key.startsWith("raffle_")) {
        map[s.key] = s.value;
      }
    });
    
    // Fill defaults if missing
    const defaults: Record<string, string> = {
      "raffle_standard_500": "20",
      "raffle_standard_nowin": "40",
      "raffle_standard_200": "30",
      "raffle_standard_1000": "10",
      "raffle_grand_iphone": "0.1",
      "raffle_grand_10kgcash": "1",
      "raffle_grand_1kchips": "18.9",
      "raffle_grand_200gcash": "80"
    };

    Object.keys(defaults).forEach(k => {
      if (!map[k]) map[k] = defaults[k];
    });

    setSettings(map);
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await updateSystemSettings(settings);
    if (res.success) {
      alert("Settings updated successfully.");
    } else {
      setError(res.error || "Failed to update settings.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-vapor max-w-5xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
            Odds <span className="text-primary tracking-normal">Controller</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-4">
            Calibrate the RNG probability matrix for Standard and Grand Raffle arenas.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-primary text-background rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Synchronize Matrix
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Standard Raffle */}
        <section className="space-y-6">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
               <Dices size={20} />
             </div>
             <h2 className="text-xl font-black text-on-surface uppercase tracking-tight">Standard Arena</h2>
           </div>

           <GlassCard className="p-8 space-y-6">
              {[
                { key: "raffle_standard_500", label: "500 PTS Win", icon: "💎" },
                { key: "raffle_standard_200", label: "200 PTS Win", icon: "✨" },
                { key: "raffle_standard_1000", label: "1000 PTS Jackpot", icon: "🔥" },
                { key: "raffle_standard_nowin", label: "No Win / Loss", icon: "💀" }
              ].map(item => (
                <div key={item.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span> {item.label}
                    </label>
                    <span className="text-xs font-mono text-primary font-black">{settings[item.key]}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full accent-primary bg-white/5"
                    value={settings[item.key]}
                    onChange={e => setSettings({...settings, [item.key]: e.target.value})}
                  />
                </div>
              ))}
           </GlassCard>
        </section>

        {/* Grand Raffle */}
        <section className="space-y-6">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-tertiary/10 text-tertiary rounded-lg border border-tertiary/20">
               <Trophy size={20} />
             </div>
             <h2 className="text-xl font-black text-on-surface uppercase tracking-tight">Grand Arena</h2>
           </div>

           <GlassCard className="p-8 space-y-6">
              {[
                { key: "raffle_grand_iphone", label: "iPhone 15+ Jackpot", icon: "📱" },
                { key: "raffle_grand_10kgcash", label: "10k GCash Prize", icon: "💸" },
                { key: "raffle_grand_1kchips", label: "1k Chips Reward", icon: "🎫" },
                { key: "raffle_grand_200gcash", label: "200 GCash Base", icon: "🎁" }
              ].map(item => (
                <div key={item.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span> {item.label}
                    </label>
                    <span className="text-xs font-mono text-tertiary font-black">{settings[item.key]}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="50"
                    step="0.01"
                    className="w-full accent-tertiary bg-white/5"
                    value={settings[item.key]}
                    onChange={e => setSettings({...settings, [item.key]: e.target.value})}
                  />
                </div>
              ))}
              <div className="p-4 bg-tertiary/5 rounded-xl border border-tertiary/10">
                 <p className="text-[10px] text-tertiary font-black uppercase tracking-widest flex items-center gap-2 mb-2">
                   <AlertCircle size={12} /> Auto-Balance logic
                 </p>
                  <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                    Total Allocation: {(
                      parseFloat(settings.raffle_grand_iphone || "0") + 
                      parseFloat(settings.raffle_grand_10kgcash || "0") + 
                      parseFloat(settings.raffle_grand_1kchips || "0") + 
                      parseFloat(settings.raffle_grand_200gcash || "0")
                    ).toFixed(2)}%
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed mt-1 italic opacity-60">
                    * Ensure total equals 100% for precise RNG distribution.
                  </p>
              </div>
           </GlassCard>
        </section>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-center font-bold">
          {error}
        </div>
      )}
    </div>
  );
}
