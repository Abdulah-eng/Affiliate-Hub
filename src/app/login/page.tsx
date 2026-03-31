"use client";

import React, { useState } from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield, Zap } from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-md relative z-10 animate-vapor">
        {/* Logo/Brand Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 border border-primary/20 shadow-[0_0_20px_rgba(129,236,255,0.1)]">
            <Shield className="text-primary" size={32} />
          </div>
          <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface">
            The <span className="text-primary">Kinetic</span> Vault
          </h1>
          <p className="text-on-surface-variant mt-2 font-medium">Access your high-performance affiliate hub</p>
        </div>

        <GlassCard className="p-10 neon-glow-primary border-primary/20">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em] ml-1">Email Identifier</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-low/50 px-12 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline text-on-surface" 
                  placeholder="name@vault.ph"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">Security Key</label>
                <Link href="#" className="text-[10px] uppercase font-bold text-on-surface-variant hover:text-primary transition-colors tracking-widest">Recovery?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low/50 px-12 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline text-on-surface font-mono" 
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1 pt-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary" />
              <label htmlFor="remember" className="text-xs text-on-surface-variant font-medium cursor-pointer">Trust this terminal for 30 days</label>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-primary text-background rounded-xl font-black font-headline tracking-widest uppercase shadow-[0_0_30px_rgba(129,236,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group px-4"
            >
              INITIALIZE SESSION <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-outline-variant/20 text-center">
            <p className="text-sm text-on-surface-variant">
              New operative? <Link href="/apply" className="text-primary font-bold hover:underline underline-offset-4">Submit Application</Link>
            </p>
          </div>
        </GlassCard>

        {/* Footer info */}
        <div className="mt-12 flex justify-between items-center px-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
            <Zap size={10} /> Latency: 12ms
          </div>
          <div className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
            v0.4.2-STABLE
          </div>
        </div>
      </div>
    </div>
  );
}
