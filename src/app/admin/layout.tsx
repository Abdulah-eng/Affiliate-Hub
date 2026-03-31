"use client";

import React from 'react';
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Bell, Search, Settings, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navbar */}
      <header className="fixed top-0 w-full z-50 bg-[#060e20]/80 backdrop-blur-xl border-b border-primary/10 shadow-[0_0_40px_rgba(110,155,255,0.08)] flex justify-between items-center h-16 px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold tracking-tighter text-primary font-headline">
            Affiliate Hub <span className="text-on-surface">PH</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-on-surface-variant">
            <span className="hover:text-primary transition-colors cursor-pointer">Network Status</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Global Config</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-on-surface-variant hover:bg-primary/10 rounded-full transition-all active:scale-95 group">
              <Bell size={20} className="group-hover:rotate-12" />
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-primary/10 rounded-full transition-all active:scale-95 group">
              <Settings size={20} className="group-hover:rotate-90 duration-500" />
            </button>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-primary/20 hover:border-primary/50 transition-all cursor-pointer">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlsLcOuvmzfKivHQA2F4NGV6TtMj9QxRO3c6MFZAe9coHlLSph5GoxHyFDPz0buZO3bkjApYKcMqPcIaQD92YCGMKw1rYmvOgejb7cwbCxlIpNezlIySbo7ajE-g4S7yT5fe_26QjggOL5843H21FbUo9hcS6QhYiJ7DUuS5hbCNvUulWaGOhS1Oap3yRA6tEZFt4n2HEqLnqaRckIB0i0lSDt6ZrQUoL90DrqROSezDqlDRZ601SD8QYG9ASNOyEaf3I_H-1OaFY" 
                alt="Admin" 
              />
            </div>
          </div>
        </div>
      </header>

      <AdminSidebar />
      
      <main className="md:ml-64 pt-24 pb-12 px-6 md:px-10 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
