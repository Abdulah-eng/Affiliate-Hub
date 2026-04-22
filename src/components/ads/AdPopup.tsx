"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { X, ExternalLink, Megaphone } from "lucide-react";
import { getActiveAds } from "@/app/actions/ads";
import { cn } from "@/lib/utils";

export function AdPopup() {
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const activeAds = await getActiveAds();
        if (activeAds && activeAds.length > 0) {
          // Check if any ad has NOT been seen in this session
          for (const ad of activeAds) {
            const seen = sessionStorage.getItem(`ad_seen_${ad.id}`);
            if (!seen) {
              setCurrentAd(ad);
              // Small delay to make it feel deliberate
              setTimeout(() => setIsVisible(true), 1500);
              break;
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch ads:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (currentAd) {
      sessionStorage.setItem(`ad_seen_${currentAd.id}`, "true");
    }
  };

  if (!isVisible || !currentAd) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="max-w-lg w-full relative animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out">
        {/* Header Branding */}
        <div className="absolute -top-12 left-0 right-0 flex justify-between items-center px-2">
           <div className="flex items-center gap-2 text-primary">
              <Megaphone size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Special Intelligence</span>
           </div>
           <button 
             onClick={handleClose}
             className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-all group"
           >
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close Intelligence</span>
              <X size={20} />
           </button>
        </div>

        <GlassCard className="overflow-hidden border-primary/20 shadow-[0_0_50px_rgba(129,236,255,0.15)] flex flex-col">
          {/* Ad Creative */}
          <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
            <img 
              src={currentAd.imageUrl} 
              alt={currentAd.title} 
              className="w-full h-full object-cover"
            />
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent" />
            
            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
               <div>
                  <h2 className="text-3xl font-black font-headline text-on-surface leading-none uppercase tracking-tighter">
                    {currentAd.title}
                  </h2>
                  <div className="h-1 w-12 bg-primary mt-4" />
               </div>
               
               <div className="flex gap-4">
                  {currentAd.externalLink ? (
                    <a 
                      href={currentAd.externalLink}
                      target="_blank"
                      onClick={handleClose}
                      className="flex-1 py-4 bg-primary text-background font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                    >
                       Acknowledge Protocol <ExternalLink size={14} strokeWidth={3} />
                    </a>
                  ) : (
                    <button 
                      onClick={handleClose}
                      className="flex-1 py-4 bg-primary text-background font-black uppercase tracking-widest text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                    >
                       Continue to Dashboard
                    </button>
                  )}
               </div>
            </div>
          </div>
        </GlassCard>
        
        <p className="text-center mt-6 text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-[0.2em]">
          End of Briefing
        </p>
      </div>
    </div>
  );
}
