import React from 'react';
import Link from 'next/link';
import { Bell, User, Zap } from 'lucide-react';
import Image from 'next/image';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 right-0 w-full h-24 z-50 bg-[#060e20]/60 backdrop-blur-xl border-b border-[#81ecff]/10">
      <div className="flex justify-between items-center px-8 w-full h-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/" className="relative h-24 w-64 flex items-center justify-center">
            <Image 
              src="/WhatsApp_Image_2026-04-11_at_01.17.27-removebg-preview.png" 
              alt="Logo" 
              width={220}
              height={110}
              className="object-contain h-full w-auto" 
              priority
            />
          </Link>
          <div className="hidden md:flex gap-10 items-center">
            <Link href="/" className="text-[#81ecff] border-b-2 border-[#81ecff] pb-1 font-headline font-medium text-sm">
              Network
            </Link>
            <Link href="/insights" className="text-[#a3aac4] hover:text-[#dee5ff] transition-all font-headline font-medium text-sm">
              Insights
            </Link>
            <Link href="/help" className="text-[#a3aac4] hover:text-[#dee5ff] transition-all font-headline font-medium text-sm">
              Help
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/apply"
            className="hidden md:flex items-center gap-2 px-6 py-2 bg-primary text-background rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(129,236,255,0.3)]"
          >
            Quick Apply
          </Link>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-[#141f38]/50 rounded-full transition-all text-[#a3aac4]">
              <Bell size={20} />
            </button>
            <Link href="/login" className="p-2 hover:bg-[#141f38]/50 rounded-full transition-all text-[#a3aac4]">
              <User size={20} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
