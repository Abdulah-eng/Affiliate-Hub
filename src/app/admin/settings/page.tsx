"use client";

import React, { useState, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import { updateAdminPassword } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await updateAdminPassword(formData);
      if (res.success) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(res.error || "Execution failed");
      }
    });
  };

  return (
    <div className="space-y-12 animate-vapor max-w-4xl">
      <div>
        <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
          Nexus <span className="text-primary tracking-normal not-italic">Settings</span>
        </h1>
        <p className="text-on-surface-variant max-w-xl text-lg font-medium mt-2">
          Manage administrative credentials and security protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <GlassCard className="p-8 border-primary/10 overflow-hidden relative">
           <div className="absolute -right-10 -top-10 opacity-5 rotate-12 pointer-events-none">
              <ShieldCheck size={200} className="text-primary" />
           </div>
           
           <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Lock size={24} />
                 </div>
                 <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Security Protocol Update</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Current Password</label>
                    <div className="relative">
                       <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                       <input 
                         name="currentPassword"
                         type="password" 
                         required
                         className="w-full bg-surface-container-low border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm font-mono focus:border-primary outline-none transition-all"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">New Terminal Secret</label>
                       <input 
                         name="newPassword"
                         type="password" 
                         required
                         className="w-full bg-surface-container-low border border-white/10 rounded-xl py-4 px-4 text-sm font-mono focus:border-primary outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Confirm Secret</label>
                       <input 
                         name="confirmPassword"
                         type="password" 
                         required
                         className="w-full bg-surface-container-low border border-white/10 rounded-xl py-4 px-4 text-sm font-mono focus:border-primary outline-none transition-all"
                       />
                    </div>
                 </div>

                 {error && (
                   <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold animate-pulse">
                      <ShieldAlert size={18} /> {error}
                   </div>
                 )}

                 {success && (
                   <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 size={18} /> Password successfully synchronized across the network.
                   </div>
                 )}

                 <button 
                   type="submit"
                   disabled={isPending}
                   className="px-12 py-5 bg-primary text-background rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_0_30px_rgba(129,236,255,0.3)] disabled:opacity-50"
                 >
                   {isPending ? <Loader2 className="animate-spin" /> : "Deploy Updates"}
                 </button>
              </form>
           </div>
        </GlassCard>

        <GlassCard className="p-8 border-white/5 bg-white/[0.02]">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                 <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-black text-on-surface uppercase tracking-tight">Access Level</h3>
           </div>
           <p className="text-sm text-on-surface-variant leading-relaxed">
              You are currently authenticated as an <span className="text-primary font-black">Authorized Administrative Operative</span>. 
              Ensure all terminal sessions are concluded in a secure environment. Unauthorized access to the Nexus will trigger a global lockdown.
           </p>
        </GlassCard>
      </div>
    </div>
  );
}
