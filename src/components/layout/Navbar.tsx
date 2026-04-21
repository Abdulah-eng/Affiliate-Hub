import React from 'react';
import Link from 'next/link';
import { Bell, User, Zap } from 'lucide-react';
import { getImageSrc } from '@/lib/utils';
import { SafeImage } from '@/components/ui/SafeImage';

export const Navbar = ({ logo }: { logo?: string }) => {
  const logoSrc = getImageSrc(logo || "/WhatsApp_Image_2026-04-11_at_01.17.27-removebg-preview.png");

  return (
    <nav className="fixed top-0 right-0 w-full h-24 z-50 bg-[#060e20]/80 backdrop-blur-2xl border-b border-[#81ecff]/10">
      <div className="flex justify-between items-center px-4 w-full h-full max-w-[1600px] mx-auto">
        <div className="flex items-center">
          <Link href="/" className="relative h-52 w-auto min-w-[200px] flex items-center justify-start -ml-6 group px-4">
            <SafeImage 
              src={logoSrc} 
              alt="Logo" 
              className="object-contain h-full w-auto transform transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_30px_rgba(129,236,255,0.6)]" 
            />
          </Link>
          <div className="flex gap-4 sm:gap-8 items-center pt-4">
            <Link href="/" className="text-[#81ecff] border-b-2 border-[#81ecff] pb-1 font-headline font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] whitespace-nowrap">
              Network
            </Link>
            <Link href="/insights" className="text-[#a3aac4] hover:text-[#dee5ff] transition-all font-headline font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] whitespace-nowrap">
              Insights
            </Link>
            <Link href="/help" className="text-[#a3aac4] hover:text-[#dee5ff] transition-all font-headline font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] whitespace-nowrap">
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
