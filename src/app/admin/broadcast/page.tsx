"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Radio, 
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { broadcastNotification } from "@/app/actions/notifications";

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"INFO" | "SUCCESS" | "WARNING" | "ERROR">("INFO");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Title and Message are required.");
      return;
    }
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    const res = await broadcastNotification(title, message, type);
    setSubmitting(false);

    if (res.success) {
      setSuccess(`Broadcasted successfully to ${res.count} node(s).`);
      setTitle("");
      setMessage("");
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(res.error || "Broadcast failed.");
    }
  };

  const IconForType = (t: string) => {
    switch (t) {
      case "SUCCESS": return <ShieldCheck size={18} className="text-emerald-400" />;
      case "ERROR": return <AlertTriangle size={18} className="text-red-400" />;
      case "WARNING": return <AlertTriangle size={18} className="text-amber-400" />;
      default: return <Info size={18} className="text-primary" />;
    }
  };

  return (
    <div className="animate-vapor max-w-4xl mx-auto space-y-10">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">Communication Protocol</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
          Network <span className="text-primary tracking-normal">Broadcast</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-4">
          Transmit real-time critical alerts, updates, or campaigns directly into the notification feeds of all active vault agents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="p-8 bg-surface-container relative overflow-hidden group border-primary/20 hover:shadow-[0_20px_50px_rgba(129,236,255,0.15)] transition-all">
           <div className="absolute inset-0 bg-surface-container/80 backdrop-blur-xl z-0"></div>
           <div className="absolute -right-10 top-0 opacity-10 rotate-12 group-hover:scale-125 transition-transform duration-1000 z-0 text-primary">
              <Radio size={160} />
            </div>

           <form onSubmit={handleBroadcast} className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Radio size={16} className="text-primary animate-pulse" />
                <h4 className="text-sm font-black uppercase tracking-tight text-on-surface">Compose Transmission</h4>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Alert Type</label>
                <div className="flex gap-2 bg-surface-container-low p-2 rounded-xl border border-outline-variant/10">
                  {["INFO", "SUCCESS", "WARNING", "ERROR"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t as any)}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors flex justify-center items-center gap-2",
                        type === t 
                           ? (t === "INFO" ? "bg-primary/20 text-primary" : t === "SUCCESS" ? "bg-emerald-500/20 text-emerald-400" : t === "WARNING" ? "bg-amber-500/20 text-amber-500" : "bg-red-500/20 text-red-500")
                           : "text-on-surface-variant hover:bg-surface-container-high/50"
                      )}
                    >
                      {IconForType(t)} {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Transmission Subject</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Server Maintenance at 24:00"
                  className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-sm font-bold text-on-surface outline-none focus:border-primary transition-colors focus:shadow-[0_0_15px_rgba(129,236,255,0.2)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Payload Parameters</label>
                <textarea 
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Enter the critical information..."
                  className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-sm font-medium text-on-surface outline-none focus:border-primary transition-colors focus:shadow-[0_0_15px_rgba(129,236,255,0.2)] resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-3 text-red-400 text-xs font-bold">
                  <AlertTriangle size={14} className="shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-3 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 size={14} className="shrink-0" /> {success}
                </div>
              )}

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-primary text-slate-950 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(129,236,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : "Dispatch to Global Network"}
                {!submitting && <Send size={14} />}
              </button>
           </form>
        </GlassCard>

        <div className="space-y-6">
          <h3 className="text-sm font-headline font-black text-on-surface-variant uppercase tracking-[0.2em]">
            Live Preview
          </h3>
          <p className="text-xs text-on-surface-variant font-medium">This is exactly how the agent will observe the incoming alert via their notification feed.</p>
          
          <div className="max-w-[320px] bg-surface-container-highest/95 border border-outline-variant/10 rounded-2xl shadow-2xl overflow-hidden mt-6">
              <div className="p-4 border-b border-outline-variant/5 flex items-center justify-between bg-surface-container-low/20">
                <div>
                  <h3 className="text-sm font-black font-headline text-on-surface uppercase tracking-tight">System Alerts</h3>
                </div>
              </div>
              <div className="p-4 bg-surface-container-low/40 relative group">
                <div className={cn("absolute left-0 top-0 bottom-0 w-1 shadow-[0_0_10px_rgba(129,236,255,0.5)]", type === "SUCCESS" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : type === "ERROR" ? "bg-red-500" : type === "WARNING" ? "bg-amber-500" : "bg-primary")}></div>
                <div className="flex gap-4">
                  <div className={cn("w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border", 
                     type === "SUCCESS" ? "bg-emerald-500/10 border-emerald-500/20" : type === "ERROR" ? "bg-red-500/10 border-red-500/20" : type === "WARNING" ? "bg-amber-500/10 border-amber-500/20" : "bg-primary/10 border-primary/20"
                  )}>
                    {IconForType(type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-tight text-on-surface break-words">
                      {title || "Subject Line"}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed font-medium">
                      {message || "Payload data will render here..."}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 mt-2">
                       Just Now
                    </p>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
