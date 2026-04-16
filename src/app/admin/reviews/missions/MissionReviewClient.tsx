"use client";

import React, { useState, useTransition } from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  User, 
  Trophy,
  Loader2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminReviewTaskProgress } from "@/app/actions/tasks";
import { adminReviewSubmission as adminReviewPromoSubmission } from "@/app/actions/promos";
import { useRouter } from "next/navigation";

export default function MissionReviewClient({ 
  initialTaskSubmissions,
  initialPromoSubmissions 
}: { 
  initialTaskSubmissions: any[],
  initialPromoSubmissions: any[]
}) {
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Normalize and merge submissions
  const allSubmissions = [
    ...initialTaskSubmissions.map(s => ({ ...s, type: 'TASK' })),
    ...initialPromoSubmissions.map(p => ({ 
      ...p, 
      type: 'PROMO',
      task: { title: p.promo.title, points: p.promo.pointsAward },
      proofUrl: p.screenshotUrl 
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleReview = (id: string, status: "COMPLETED" | "REJECTED", type: string) => {
    if (isPending) return;
    startTransition(async () => {
      let res;
      if (type === 'TASK') {
        res = await adminReviewTaskProgress(id, status);
      } else {
        // Map status for promos: COMPLETED -> APPROVED
        const promoStatus = status === "COMPLETED" ? "APPROVED" : "REJECTED";
        res = await adminReviewPromoSubmission(id, promoStatus);
      }
      
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  };

  if (allSubmissions.length === 0) {
    return (
      <GlassCard className="py-20 flex flex-col items-center justify-center text-center opacity-60">
        <Trophy size={48} className="mb-4" />
        <p className="font-black uppercase tracking-widest text-sm">Review Queue Optimal</p>
        <p className="text-[10px] font-bold mt-1 text-on-surface-variant">No pending challenge submissions detected.</p>
      </GlassCard>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {allSubmissions.map((sub: any) => (
          <GlassCard key={`${sub.type}-${sub.id}`} className="p-6 border-white/5 hover:border-primary/20 transition-all flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className={cn(
                "w-12 h-12 rounded-xl border flex items-center justify-center font-black",
                sub.type === 'TASK' ? "bg-primary/10 border-primary/20 text-primary" : "bg-purple-500/10 border-purple-500/20 text-purple-400"
              )}>
                {sub.type === 'TASK' ? 'T' : 'P'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-headline font-black text-on-surface uppercase tracking-tight">{sub.task?.title}</p>
                  <span className={cn(
                    "text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest",
                    sub.type === 'TASK' ? "bg-primary/10 text-primary" : "bg-purple-500/10 text-purple-400"
                  )}>
                    {sub.type === 'TASK' ? 'Mission' : 'Promo'}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">
                  @{sub.user?.username || sub.user?.name} • {sub.task?.points} PTS
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              {sub.proofUrl ? (
                <button 
                  onClick={() => setSelectedProof(sub.proofUrl)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-on-surface border border-white/10 rounded-lg flex items-center gap-2"
                >
                  <Eye size={14} /> View Evidence
                </button>
              ) : (
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">No Proof Attached</span>
              )}

              <div className="h-8 w-[1px] bg-white/5 hidden md:block"></div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleReview(sub.id, "REJECTED", sub.type)}
                  disabled={isPending}
                  className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all active:scale-95"
                  title="Reject"
                >
                  <XCircle size={20} />
                </button>
                <button 
                  onClick={() => handleReview(sub.id, "COMPLETED", sub.type)}
                  disabled={isPending}
                  className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl transition-all active:scale-95"
                  title="Approve"
                >
                  <CheckCircle2 size={20} />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Proof Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <button 
            onClick={() => setSelectedProof(null)}
            className="absolute top-6 right-6 p-4 text-on-surface-variant hover:text-white transition-colors"
          >
            <X size={32} />
          </button>
          <div className="max-w-4xl max-h-[90vh] relative group">
            <img 
              src={selectedProof} 
              alt="Mission Verification Proof" 
              className="w-full h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(129,236,255,0.2)]" 
            />
            <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-slate-950 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
               <p className="text-white font-black uppercase tracking-widest text-center text-sm">Visual Evidence Validation</p>
            </div>
          </div>
        </div>
      )}

      {isPending && (
        <div className="fixed inset-0 z-[110] bg-slate-950/20 backdrop-blur-[2px] cursor-wait flex items-center justify-center">
            <Loader2 size={48} className="text-primary animate-spin" />
        </div>
      )}
    </>
  );
}
