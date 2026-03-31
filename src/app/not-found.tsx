"use client";

import React from 'react';
import Link from 'next/link';
import { GlassCard } from "@/components/ui/GlassCard";
import { MoveLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 animate-vapor">
      <GlassCard className="max-w-md w-full p-12 text-center border-primary/20 bg-surface-container-low/40 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 size-40 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
        
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(129,236,255,0.1)]">
            <HelpCircle size={32} />
          </div>
        </div>

        <h1 className="text-6xl font-black font-headline text-on-surface tracking-tighter mb-4">404</h1>
        <h2 className="text-xl font-black text-primary uppercase tracking-widest mb-6">Node Not Found</h2>
        
        <p className="text-on-surface-variant text-sm font-medium mb-10 leading-relaxed uppercase tracking-tight">
          The requested navigational node does not exist in the current Kinetic Vault architecture. 
        </p>

        <Link 
          href="/" 
          className="w-full py-4 bg-primary text-background font-black uppercase tracking-[0.3em] rounded-xl shadow-[0_0_30px_rgba(129,236,255,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95 text-[10px]"
        >
          <MoveLeft size={16} /> Return to Lobby
        </Link>
      </GlassCard>
    </div>
  );
}
