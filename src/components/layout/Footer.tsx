import React from 'react';
import Link from 'next/link';
import { Mail, Share2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/10 py-16 px-8 mt-24">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="col-span-2 space-y-6">
          <div className="flex items-center mb-8">
            <img src="/WhatsApp_Image_2026-04-11_at_01.17.27-removebg-preview.png" alt="Logo" className="h-28 w-auto object-contain scale-125" />
          </div>
          <p className="text-on-surface-variant max-w-sm leading-relaxed text-sm">
            The premier destination for Philippine-based digital entrepreneurs. Built on the Kinetic Vault engine for absolute performance.
          </p>
          <div className="flex gap-4">
            <a className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:text-primary transition-colors hover:shadow-[0_0_15px_rgba(129,236,255,0.2)]" href="#">
              <Share2 size={20} />
            </a>
            <a className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:text-primary transition-colors hover:shadow-[0_0_15px_rgba(129,236,255,0.2)]" href="#">
              <Mail size={20} />
            </a>
          </div>
        </div>
        <div className="space-y-4">
          <h5 className="font-bold text-on-surface font-headline uppercase text-xs tracking-widest">Platform</h5>
          <ul className="space-y-2 text-on-surface-variant text-sm">
            <li><Link className="hover:text-primary transition-colors" href="/network">Affiliate Network</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/insights">Insights & Data</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/apply">KYC Verification</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/agent">Agent Portal</Link></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h5 className="font-bold text-on-surface font-headline uppercase text-xs tracking-widest">Support</h5>
          <ul className="space-y-2 text-on-surface-variant text-sm">
            <li><Link className="hover:text-primary transition-colors" href="/help">Help Center</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/api">API Docs</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/terms">Terms of Service</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-outline-variant/5 text-center text-xs text-on-surface-variant/50">
        © 2024 Affiliate Hub PH. All rights reserved. Secured by Kinetic Vault Systems.
      </div>
    </footer>
  );
};
