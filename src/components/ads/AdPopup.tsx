"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { X, ExternalLink, Megaphone } from "lucide-react";
import { getActiveAds } from "@/app/actions/ads";
import { cn, getImageSrc } from "@/lib/utils";

export function AdPopup() {
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [closeClicks, setCloseClicks] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const activeAds = await getActiveAds();
        if (activeAds && activeAds.length > 0) {
          setCurrentAd(activeAds[0]);
          setTimeout(() => setIsVisible(true), 1000);
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
    if (closeClicks === 0 && currentAd?.externalLink) {
      window.open(currentAd.externalLink, "_blank");
      setCloseClicks(1);
    } else {
      setIsVisible(false);
      if (currentAd) {
        sessionStorage.setItem(`ad_seen_${currentAd.id}`, "true");
      }
    }
  };

  if (!currentAd || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background/90 backdrop-blur-md animate-in fade-in duration-500">
       <div className="relative w-full max-w-sm animate-in zoom-in-95 duration-500 delay-200">
          <GlassCard className="overflow-hidden border-primary/20 shadow-[0_0_50px_rgba(129,236,255,0.15)]">
             {/* Header */}
             <div className="p-4 flex items-center justify-between border-b border-white/5 bg-surface-container/50">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Megaphone size={16} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Security Briefing</p>
                      <h3 className="text-xs font-black text-on-surface uppercase tracking-tight mt-1">Intelligence Update</h3>
                   </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="p-2 text-on-surface-variant hover:text-white transition-all cursor-pointer group"
                  title="Acknowledge & Close"
                >
                  <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
             </div>

             {/* Ad Creative */}
             <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
               <img 
                 src={getImageSrc(currentAd.imageUrl)} 
                 alt={currentAd.title} 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
               <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-2xl font-black text-on-surface leading-tight uppercase">{currentAd.title}</h2>
               </div>
             </div>

             {/* Action */}
             <div className="p-6 bg-surface-container/30">
               {currentAd.externalLink ? (
                 <a 
                   href={currentAd.externalLink}
                   target="_blank"
                   onClick={() => setIsVisible(false)}
                   className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-background rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                 >
                   Acknowledge Protocol <ExternalLink size={14} />
                 </a>
               ) : (
                 <button 
                   onClick={handleClose}
                   className="w-full py-4 bg-surface-container-high text-on-surface rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-background transition-all"
                 >
                   Briefing Complete
                 </button>
               )}
             </div>
          </GlassCard>
       </div>
    </div>
  );
}
