"use client";

import React, { useState } from 'react';
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Bell, Search, Settings, ShieldCheck, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AdminNotificationSync } from "@/components/admin/AdminNotificationSync";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useSession } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <AdminNotificationSync />
      {/* Admin Navbar */}
      <header className="fixed top-0 w-full z-50 bg-[#060e20]/80 backdrop-blur-xl border-b border-primary/10 shadow-[0_0_40px_rgba(110,155,255,0.08)] flex justify-between items-center h-16 px-6">
        <div className="flex items-center gap-4">
          <button 
            className="p-2 rounded-full hover:bg-white/5 text-primary transition-colors md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <Link href="/" className="relative h-12 w-32 flex items-center justify-center -ml-4">
            <img 
              src="/WhatsApp_Image_2026-04-11_at_01.17.27-removebg-preview.png" 
              alt="Logo" 
              className="absolute max-w-none h-20 w-auto object-contain scale-[1.75]" 
            />
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-on-surface-variant">
            <span onClick={() => alert("Network status is optimal")} className="hover:text-primary transition-colors cursor-pointer">Network Status</span>
            <span onClick={() => alert("Global configuration accessed via settings page")} className="hover:text-primary transition-colors cursor-pointer">Global Config</span>
          </div>
          
          <div className="flex items-center gap-3">
            {session?.user?.id && <NotificationBell userId={session.user.id} />}
            <Link 
              href="/admin/settings"
              className="p-2 text-on-surface-variant hover:bg-primary/10 rounded-full transition-all active:scale-95 group"
            >
              <Settings size={20} className="group-hover:rotate-90 duration-500" />
            </Link>
            <Link 
              href="/admin/settings"
              className="block h-8 w-8 rounded-full overflow-hidden border border-primary/20 hover:border-primary/50 transition-all cursor-pointer relative z-[60]"
            >
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlsLcOuvmzfKivHQA2F4NGV6TtMj9QxRO3c6MFZAe9coHlLSph5GoxHyFDPz0buZO3bkjApYKcMqPcIaQD92YCGMKw1rYmvOgejb7cwbCxlIpNezlIySbo7ajE-g4S7yT5fe_26QjggOL5843H21FbUo9hcS6QhYiJ7DUuS5hbCNvUulWaGOhS1Oap3yRA6tEZFt4n2HEqLnqaRckIB0i0lSDt6ZrQUoL90DrqROSezDqlDRZ601SD8QYG9ASNOyEaf3I_H-1OaFY" 
                alt="Admin" 
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
        </div>
      </header>

      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="md:ml-64 pt-24 pb-12 px-6 md:px-10 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
