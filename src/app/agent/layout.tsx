"use client";

import React, { useState } from 'react';
import { AgentSidebar } from "@/components/layout/AgentSidebar";
import { 
  Bell, 
  Menu, 
  UserCircle, 
  TrendingUp, 
  Wallet,
  Globe,
  Layers
} from "lucide-react";
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user as any;
  const userName = user?.name || user?.username || 'Agent';
  const role = user?.role || 'AGENT';
  const points = 24500; // Mock or fetch from session/db later

  return (
    <div className="min-h-screen bg-background">
      <AgentSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 bg-slate-950/80 backdrop-blur-xl z-50 flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] lg:ml-72 transition-all">
        <div className="flex items-center justify-between px-6 lg:px-12 h-20">
          <div className="flex items-center gap-6">
            <button 
              className="p-2 rounded-full hover:bg-white/5 text-primary transition-colors lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-headline font-bold text-on-surface hidden sm:block">Agent Command</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors relative group">
                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_#81ecff]"></span>
              </button>
              <Link 
                href="/agent/settings"
                className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary p-[1px] cursor-pointer hover:shadow-[0_0_15px_rgba(129,236,255,0.3)] transition-all group"
              >
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <UserCircle size={24} className="text-primary group-hover:scale-110 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Sub-header Context Bar */}
        <div className="bg-surface-container-low/90 backdrop-blur-lg border-y border-white/5 py-3 px-6 lg:px-12 flex items-center gap-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest">Rank</span>
            <span className="text-xs font-black text-cyan-400 px-4 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 shadow-[0_0_10px_rgba(0,229,255,0.1)] uppercase">
              {user?.kycStatus === 'APPROVED' ? 'Elite Tier' : 'Pending Vault'}
            </span>
          </div>
          <div className="h-5 w-[1px] bg-white/10 shrink-0"></div>
          
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest">Performance</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-on-surface">40%</span>
              <div className="w-20 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary w-[40%] animate-pulse"></div>
              </div>
              <span className="text-primary text-[10px] font-black flex items-center gap-1 uppercase">
                <TrendingUp size={12} /> +5.2%
              </span>
            </div>
          </div>
          <div className="h-5 w-[1px] bg-white/10 shrink-0"></div>
          
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest">Points Value</span>
            <span className="text-xs font-black text-tertiary flex items-center gap-2">
              <Wallet size={14} className="text-tertiary" /> {points.toLocaleString()} PTS
            </span>
          </div>
          <div className="h-5 w-[1px] bg-white/10 shrink-0"></div>
          
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest">Vault Nodes</span>
            <span className="text-xs font-black text-on-surface flex items-center gap-2">
              <Layers size={14} className="text-primary" /> 03 <span className="text-on-surface-variant font-bold">ACTIVE</span>
            </span>
          </div>
        </div>
      </header>

      <main className="lg:ml-72 pt-44 pb-10 px-6 lg:px-12 transition-all">
        <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-176px)] flex flex-col">
          {children}
        </div>
      </main>

      {/* Background Decorative Element */}
      <div className="fixed bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
    </div>
  );
}
