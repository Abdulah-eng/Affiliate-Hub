"use client";

import React, { useState } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  UploadCloud, 
  Camera, 
  Send,
  Building2,
  Dices,
  Gamepad2,
  Users,
  ShieldCheck,
  Star,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, name: 'Account Setup' },
  { id: 2, name: 'Select Partners' },
  { id: 3, name: 'KYC Upload' },
  { id: 4, name: 'Review & Submit' }
];

const BRANDS = [
  {
    id: 'winforlife',
    name: 'WinForLife',
    desc: 'High-roller focused platform with premium retention tools and exclusive VIP events for top referrers.',
    icon: <Building2 className="text-primary" size={32} />,
    color: 'primary',
    perks: ['45% RevShare Base', 'Monthly Milestone Bonuses']
  },
  {
    id: 'bigwin',
    name: 'BIGWIN',
    desc: 'The fastest growing mass-market casino in the PH. Excellent conversion rates for mobile traffic.',
    icon: <Dices className="text-secondary" size={32} />,
    color: 'secondary',
    perks: ['50% CPA Commissions', 'Local G-Cash Support']
  },
  {
    id: 'rollem',
    name: 'Rollem',
    desc: 'Gen-Z focused social gaming ecosystem. High engagement metrics and community-driven rewards.',
    icon: <Gamepad2 className="text-tertiary" size={32} />,
    color: 'tertiary',
    perks: ['Social Referral Engine', 'Weekly Payouts']
  }
];

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(2);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['winforlife']);

  const toggleBrand = (id: string) => {
    setSelectedBrands(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30">
      <header className="fixed top-0 right-0 w-full h-16 z-40 bg-[#060e20]/60 backdrop-blur-xl border-b border-[#81ecff]/10 flex justify-between items-center px-8">
        <Link href="/" className="flex items-center gap-4">
          <span className="text-lg font-black text-primary tracking-tight font-headline">Affiliate Hub PH</span>
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/network" className="text-on-surface-variant hover:text-on-surface font-headline font-medium text-sm transition-all">Network</Link>
          <Link href="/insights" className="text-on-surface-variant hover:text-on-surface font-headline font-medium text-sm transition-all">Insights</Link>
          <Link href="/help" className="text-on-surface-variant hover:text-on-surface font-headline font-medium text-sm transition-all">Help</Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/30">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGgRZNNklw0S98iWWdNL8897PkD_uoo9eXjPjoob74HlAqWa1flUxTVlpsLMl04lwECOAA85Th75PQ_GINa0A5PAEl00zVRp8oXn7dXLInMfmtrS4zbwcgZ3w8a_DxzkpNHP_ONjJOu-zm7WZ4JsyZmPwzlCMMzMFiuhEvT9tarQramBc1qxhodj9cst90M90w7wwy3WI3zEw156IsjlkTqLPKBc-A5gPk9bPFIXyzMkzOovnQVw4CZbBM_c8bnrKT7-Sa2IIGYNU" 
              alt="User"
            />
          </div>
        </div>
      </header>

      <main className="pt-32 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Progress Stepper */}
        <div className="mb-16">
          <div className="flex items-center justify-between max-w-4xl mx-auto relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 w-full h-1 bg-surface-container-high z-0">
              <div 
                className="h-full bg-gradient-to-r from-primary via-secondary to-surface-variant transition-all duration-500" 
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              ></div>
            </div>
            
            {/* Steps */}
            {STEPS.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 font-bold",
                  currentStep > step.id ? "bg-primary text-background shadow-[0_0_15px_rgba(129,236,255,0.5)]" : 
                  currentStep === step.id ? "bg-primary text-background ring-4 ring-primary/20 shadow-[0_0_20px_rgba(129,236,255,0.4)]" :
                  "bg-surface-container-high border border-outline-variant text-on-surface-variant"
                )}>
                  {currentStep > step.id ? <Check size={18} /> : step.id}
                </div>
                <span className={cn(
                  "text-xs font-medium font-headline tracking-wide transition-colors",
                  currentStep >= step.id ? "text-primary" : "text-on-surface-variant"
                )}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Brand Selection */}
        {currentStep === 2 && (
          <section className="animate-vapor">
            <div className="mb-12 text-center">
              <h1 className="text-3xl md:text-5xl font-extrabold font-headline tracking-tight text-on-surface mb-4">Choose Your Alliance</h1>
              <p className="text-on-surface-variant max-w-lg mx-auto text-lg leading-relaxed">
                Select the brands you wish to promote. You can multi-select to maximize your earning potential.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {BRANDS.map((brand) => (
                <div 
                  key={brand.id}
                  onClick={() => toggleBrand(brand.id)}
                  className={cn(
                    "glass-panel p-8 rounded-xl relative group cursor-pointer transition-all duration-500 border-2",
                    selectedBrands.includes(brand.id) 
                      ? "border-primary/40 ring-1 ring-primary/20 bg-primary/5" 
                      : "border-transparent hover:border-primary/20 hover:bg-surface-container-low"
                  )}
                >
                  <div className={cn(
                    "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedBrands.includes(brand.id) ? "border-primary bg-primary text-background scale-110" : "border-outline-variant"
                  )}>
                    {selectedBrands.includes(brand.id) && <Check size={14} strokeWidth={4} />}
                  </div>
                  
                  <div className={cn(
                    "mb-6 h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                    brand.color === 'primary' ? "bg-primary/10" : brand.color === 'secondary' ? "bg-secondary/10" : "bg-tertiary/10"
                  )}>
                    {brand.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold font-headline mb-3 text-on-surface">{brand.name}</h3>
                  <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                    {brand.desc}
                  </p>
                  
                  <ul className="space-y-3">
                    {brand.perks.map((perk, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-medium text-primary">
                        {idx === 0 ? <Star size={14} /> : <TrendingUp size={14} />}
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Step 3: KYC Details */}
        {currentStep === 3 && (
          <section className="max-w-4xl mx-auto animate-vapor">
            <div className="mb-12">
              <h2 className="text-3xl font-bold font-headline text-on-surface mb-3">Vault Verification</h2>
              <p className="text-on-surface-variant text-lg">Secure your account by providing your identity documents and personal information.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Personal Info Fields */}
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">Legal Name</label>
                  <input 
                    type="text"
                    className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline text-on-surface" 
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">Email Address</label>
                    <input 
                      type="email"
                      className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline text-on-surface" 
                      placeholder="juan@vault.ph"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">Telegram Handle</label>
                    <input 
                      type="text"
                      className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline text-on-surface" 
                      placeholder="@juan_affiliate"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">Location</label>
                  <select className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface appearance-none">
                    <option>Metro Manila, PH</option>
                    <option>Cebu City, PH</option>
                    <option>Davao City, PH</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">Preferred Username</label>
                  <input 
                    type="text"
                    className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline text-on-surface" 
                    placeholder="VaultMaster77"
                  />
                </div>
              </div>

              {/* KYC Upload Zone */}
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">Government Issued ID</label>
                  <div className="border-2 border-dashed border-outline-variant rounded-2xl p-10 flex flex-col items-center justify-center bg-surface-container-low/50 hover:bg-surface-container-high hover:border-primary/50 transition-all cursor-pointer group">
                    <UploadCloud className="text-on-surface-variant group-hover:text-primary mb-4 transition-colors" size={40} />
                    <span className="text-sm font-bold text-on-surface mb-1">Click to upload or drag & drop</span>
                    <span className="text-xs text-on-surface-variant">PNG, JPG or PDF (Max 10MB)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">Selfie with ID</label>
                  <div className="border-2 border-dashed border-outline-variant rounded-2xl p-10 flex flex-col items-center justify-center bg-surface-container-low/50 hover:bg-surface-container-high hover:border-primary/50 transition-all cursor-pointer group">
                    <Camera className="text-on-surface-variant group-hover:text-primary mb-4 transition-colors" size={40} />
                    <span className="text-sm font-bold text-on-surface mb-1">Capture or Upload Selfie</span>
                    <span className="text-xs text-on-surface-variant">Face and ID must be clearly visible</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Form Actions */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-outline-variant/20">
          <button className="px-10 py-4 rounded-full border border-outline-variant text-on-surface font-bold hover:bg-surface-container-high transition-all">
            Save Draft
          </button>
          
          <div className="flex items-center gap-6">
            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-10 py-4 rounded-full text-on-surface-variant font-bold hover:text-on-surface transition-all flex items-center gap-2"
              >
                <ChevronLeft size={20} /> Back
              </button>
            )}
            
            <button 
              onClick={() => setCurrentStep(prev => Math.min(prev + 1, 4))}
              className="px-12 py-5 rounded-full bg-primary text-background font-black font-headline tracking-wide shadow-[0_0_30px_rgba(129,236,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {currentStep === 4 ? 'SUBMIT APPLICATION' : 'CONTINUE TO REVIEW'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </main>

      {/* Floating Help Element */}
      <aside className="fixed right-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-6 animate-vapor" style={{ animationDelay: '0.4s' }}>
        <GlassCard className="p-6 w-64 neon-glow-primary">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/20">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Support Agent</p>
              <p className="text-sm font-bold text-on-surface">Aileen Santos</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
              <ShieldCheck size={14} className="text-primary" />
              Response time: &lt; 5 mins
            </div>
            <button className="w-full py-3 bg-surface-container-high hover:bg-primary hover:text-background rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2">
              <Send size={14} /> Telegram Help
            </button>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6 w-64 border-secondary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <MessageSquare size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Live Chat</p>
              <p className="text-xs font-medium text-on-surface-variant">System Status: <span className="text-green-400">Optimal</span></p>
            </div>
          </div>
        </GlassCard>
      </aside>

      {/* Footer Decorative Gradient */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-30"></div>
    </div>
  );
}
