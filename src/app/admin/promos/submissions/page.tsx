"use client";

import React, { useState, useEffect, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Loader2, Check, X, Eye } from "lucide-react";
import { adminGetPendingSubmissions, adminReviewSubmission } from "@/app/actions/promos";

export default function PromoSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchSubmissions = async () => {
    setLoading(true);
    const data = await adminGetPendingSubmissions();
    setSubmissions(data);
    setLoading(false);
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const handleReview = (id: string, status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const res = await adminReviewSubmission(id, status);
      if (res.success) {
        fetchSubmissions();
      } else {
        alert("Action failed: " + res.error);
      }
    });
  };

  if (loading) {
     return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="animate-vapor max-w-6xl mx-auto space-y-10">
      <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
        Promo <span className="text-primary tracking-normal">Verification</span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {submissions.map(sub => (
           <GlassCard key={sub.id} className="group overflow-hidden relative">
              <div className="aspect-video bg-black relative">
                <img src={sub.screenshotUrl} alt="Proof" className="w-full h-full object-cover" />
                <a href={sub.screenshotUrl} target="_blank" rel="noreferrer" className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded backdrop-blur"><Eye size={16} /></a>
              </div>
              <div className="p-4 space-y-4">
                 <div>
                   <h3 className="font-black text-lg">{sub.promo.title}</h3>
                   <p className="text-xs text-on-surface-variant font-bold">User: {sub.user.name || sub.user.username}</p>
                 </div>
                 <div className="flex gap-2">
                   <button disabled={isPending} onClick={() => handleReview(sub.id, "APPROVED")} className="flex-1 py-3 bg-emerald-500/20 text-emerald-400 font-bold rounded-lg hover:bg-emerald-500 hover:text-white transition-all flex justify-center gap-2 items-center"><Check size={16}/> Approve</button>
                   <button disabled={isPending} onClick={() => handleReview(sub.id, "REJECTED")} className="flex-1 py-3 bg-red-500/20 text-red-400 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all flex justify-center gap-2 items-center"><X size={16}/> Reject</button>
                 </div>
              </div>
           </GlassCard>
         ))}
         {submissions.length === 0 && (
           <div className="col-span-full p-20 text-center opacity-60 text-lg font-black tracking-widest uppercase text-on-surface-variant bg-white/5 rounded-3xl border border-dashed border-white/20">
             No pending submissions
           </div>
         )}
      </div>
    </div>
  );
}
