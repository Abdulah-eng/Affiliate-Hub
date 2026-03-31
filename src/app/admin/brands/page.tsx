"use client";

import React from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Shield, 
  RefreshCcw, 
  Save, 
  Search, 
  Edit3, 
  History, 
  Link as LinkIcon,
  RotateCcw,
  Activity,
  ChevronDown
} from "lucide-react";
import { cn } from '@/lib/utils';

const BRANDS = [
  { 
    id: 'WFL-0091', 
    name: 'WinForLife', 
    url: 'https://login.winforlife.ph/gateway/v2', 
    status: 'Online',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgnt3Nah2b72BeoOneP_NixazHbXKYaq1j67ftI5yVQQpj7OLCLDPmbEvsrZ_SGW_bpURavxFhxLTUjIisyh4-AR3feacTzaULaFV_6ekzdDxjhkfma2YhKzNLiqsAj8gXGTSHL5qs_ftL96oPkb1s4S2Bw30C44KqfvQRU_rkuwFehrM7nFZwMAHOEY6WRwm3OH5wrM9o35-_mqV5KQ5qMJ3mZE8iPhNJgc8wsTmmUfJhdbiq-himYMw7_2CkKbvxFilXHJW9674'
  },
  { 
    id: 'BW-7721', 
    name: 'BIGWIN', 
    url: 'https://auth.bigwin-api.io/secure/login', 
    status: 'Online',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAD9oRJQGLouOuNRIEIOqR22xfjoPd8aOCDnWskYmYVs22PXANnjHvE8ToUcx7XVR7ffKvivaoPK-ftOQQLlnrckwTjHngfMkZ2KYtXLOThbYR_JfQlgysN38Etvt2YFtv3beGAe3Hk2IER2LND9uf06BT8Q8FC_wdnsq-yPS1vTap2zpVUSBhzl97ZiKkooJUooR1f2CdQIMf9A6uvK-Uid-eK7DviOEjnu_M0OZ5O1gi9KF5_YHn1T69gC76NT_ONOu2zvY0rIUs'
  },
  { 
    id: 'RLM-4450', 
    name: 'Rollem', 
    url: 'https://nodes.rollem-vault.com/login', 
    status: 'Maintenance',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDDUj0s2fEMs54JR2M_1ISpR5ohNuRNi8VhKZFSIAyH1ANEBa47QQDMt4Ntgpy97UXZhMj7H5RzY7GpyZ_eW9zN9Fszl74_gO1JE2JNnK1xCCwVgNF_xXXi4B8PPORUZASfPYHlMjQbcLzQQtO3L1sb7i7avdIxuwlcmFMZjn5f_7o9JMNw1_rQqg_Y05-P9etyTA87t47V7ZbWAChhMV6nZUvZk2f3igjRYKjSTH3LdGZY2xrGdebd0f2Noj2zG49QLnHjAj-ijY'
  },
  { 
    id: 'ABT-1102', 
    name: 'AceBet', 
    url: 'https://acebet.ph/portal/secure_auth', 
    status: 'Online',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMlqz8_UrsPdwbLGpxz02yP02Vz186eosHK9NYpE_HwE8urAfvEW5IgZlL3GaGccNBIIR8kIOfHfyCFZIvGKXZqKbXWj5wC110lI1ylL7p4yT9fg-rv1u_zutpMiTM2u877faXw6visG2VlatLjOA4m94N3n1j5tV9HcAu7LdSukY4_TP5YdLABp3Rf6xO8AkIDm7Cg8GQsLzosWQGDndR3SWLl-3VoOJCshHfDtztEs51fNDzhTjNekDTPOtv3TWxZVxL2hmyr1I'
  },
  { 
    id: 'GSL-8839', 
    name: 'GoldenSlot', 
    url: 'https://slot-gate.goldenslot.api/v1', 
    status: 'Online',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzyQOt-XqVOx5SDk96PGOGwRncHPgsYVfGw1sTUtdZam2QiMDfpeSND9T_xKDgQQc7_kAieDBPpvyNW0IfhFVhwuWmse5iAqu_o8qqcNp6P3Ddmp77UdewnEbGhg27r-4qN0TcNd4WupWHE4X07SZWIXaj9aDUQw6j_2ukc5zcnpUzjXxKC-rf9aD1Y0epxGAhDIaXGsgFhjDmMCiU51WV-ts9BzlSyVkRBVXciBkB2KLKbv9EoLUU1reaxxspCxJ7nyvBaLBv_zc'
  }
];

export default function BrandManagerPage() {
  return (
    <div className="animate-vapor">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface">
            Brand Login <span className="text-primary">Manager</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg font-medium">
            Centralized gateway control for partner platforms. Update authentication endpoints and monitor infrastructure status in real-time.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-4 bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-full hover:bg-surface-bright transition-all active:scale-95 font-bold uppercase tracking-widest text-xs group">
            <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            Revert All
          </button>
          <button className="flex items-center gap-2 px-8 py-4 bg-primary text-background rounded-full hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] transition-all active:scale-95 font-bold uppercase tracking-widest text-xs">
            <Save size={16} />
            Save All Changes
          </button>
        </div>
      </div>

      {/* Dashboard Stats HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <GlassCard className="p-6 flex flex-col bg-surface-container-low/40">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1 ml-1">Total Brands</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-primary font-headline tracking-tighter">05</span>
            <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">Active Platforms</span>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex flex-col bg-surface-container-low/40">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1 ml-1">System Status</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></div>
            <span className="text-2xl font-black text-on-surface font-headline tracking-tight uppercase">Optimal</span>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex flex-col bg-surface-container-low/40">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1 ml-1">Last Sync</span>
          <span className="text-2xl font-black text-on-surface font-headline tracking-tight uppercase mt-1">14:02 PM</span>
        </GlassCard>
        <GlassCard className="p-6 flex flex-col bg-surface-container-low/40 border-tertiary/20">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1 ml-1">Auth Latency</span>
          <span className="text-2xl font-black text-tertiary font-headline tracking-tight uppercase mt-1">24ms</span>
        </GlassCard>
      </div>

      {/* Brand Manager Table */}
      <GlassCard className="rounded-2xl p-0 overflow-hidden mb-12 border-primary/5 bg-surface-container-low/20">
        <div className="p-8 border-b border-outline-variant/10 bg-white/5 flex justify-between items-center">
          <h2 className="font-headline font-black text-2xl flex items-center gap-3 text-on-surface uppercase tracking-tight">
            <Shield className="text-primary" size={24} />
            Brand Gateways
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
              <input 
                className="bg-surface-container-low border border-outline-variant/30 focus:border-primary/50 focus:ring-1 focus:ring-primary text-sm rounded-full pl-12 pr-6 py-3 w-64 transition-all outline-none" 
                placeholder="Filter brands..." 
                type="text"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Partner Brand</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Gateway URL Configuration</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Health Status</th>
                <th className="px-8 py-5 text-right pr-8 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {BRANDS.map((brand) => (
                <tr key={brand.id} className="group hover:bg-white/5 transition-colors duration-500">
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-5">
                      <div className="relative w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center border border-primary/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:border-primary/30 transition-all">
                        <img src={brand.logo} alt={brand.name} className="w-9 h-9 object-contain" />
                      </div>
                      <div>
                        <p className="font-black text-on-surface font-headline tracking-tight text-lg">{brand.name}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{brand.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-3 max-w-sm">
                      <div className="flex-1 relative group/input">
                        <input 
                          readOnly
                          className="w-full bg-surface-container-highest/20 border border-outline-variant/30 focus:border-primary/50 text-sm py-3 px-4 rounded-xl text-primary font-mono transition-all group-hover/input:border-primary/20 outline-none" 
                          type="text" 
                          value={brand.url} 
                        />
                        <Edit3 className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm cursor-pointer hover:text-primary transition-colors" size={16} />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-full border w-fit font-black uppercase tracking-widest text-[10px]",
                      brand.status === 'Online' 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-tertiary/10 text-tertiary border-tertiary/20"
                    )}>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        brand.status === 'Online' ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-tertiary shadow-[0_0_8px_#a68cff]"
                      )}></span>
                      {brand.status}
                    </div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <button className="px-6 py-2.5 bg-primary/5 hover:bg-primary text-primary hover:text-background border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 bg-surface-container-low/30 border-t border-outline-variant/10 flex justify-center">
          <button className="text-on-surface-variant hover:text-primary transition-all text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 group">
            <ChevronDown className="group-hover:translate-y-1 transition-transform" size={16} />
            Load More Brands
          </button>
        </div>
      </GlassCard>

      {/* Audit Trail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <GlassCard className="lg:col-span-2 p-8 rounded-2xl bg-surface-container-low/30">
          <h3 className="font-headline font-black text-xl text-on-surface mb-8 flex items-center gap-3 uppercase tracking-tight">
            <History className="text-secondary" size={24} />
            Activity Log
          </h3>
          <div className="space-y-8">
            {[
              { user: 'Admin_J01', action: 'updated Gateway URL for', target: 'WinForLife', time: '2 minutes ago', ip: '192.168.1.105', icon: <LinkIcon size={16} />, color: 'primary' },
              { user: 'SYSTEM', action: 'completed automatic', target: 'Health Check', time: '1 hour ago', ip: 'Auto-Log', icon: <Activity size={16} />, color: 'secondary' }
            ].map((log, idx) => (
              <div key={idx} className="flex gap-5 items-start animate-vapor" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className={cn(
                  "p-3 rounded-2xl ring-1",
                  log.color === 'primary' ? "bg-primary/10 ring-primary/20 text-primary" : "bg-secondary/10 ring-secondary/20 text-secondary"
                )}>
                  {log.icon}
                </div>
                <div>
                  <p className="text-sm text-on-surface font-medium leading-relaxed">
                    <span className="font-black uppercase tracking-wide">{log.user}</span> {log.action} <span className="font-black text-primary uppercase tracking-wide">{log.target}</span>
                  </p>
                  <p className="text-[10px] font-bold text-on-surface-variant mt-2 uppercase tracking-widest flex items-center gap-3">
                    {log.time} <span className="w-1 h-1 rounded-full bg-outline-variant"></span> {log.ip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-8 rounded-2xl border-l-[6px] border-primary bg-surface-container-low/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
            <Shield size={120} className="text-primary" />
          </div>
          <h3 className="font-headline font-black text-xl text-on-surface mb-6 uppercase tracking-tight relative z-10">Security Protocol</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-10 font-medium relative z-10">
            Always ensure the Gateway URL points to an encrypted endpoint (HTTPS). Changes take effect across the affiliate network within <span className="text-primary font-black">120 seconds</span> of deployment.
          </p>
          <div className="p-6 bg-surface-container-highest/30 rounded-2xl border border-outline-variant/30 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-on-surface uppercase tracking-[0.2em]">API Integrity</span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">SECURE</span>
            </div>
            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary via-secondary to-tertiary w-full animate-pulse"></div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Floating Save FAB for Mobile */}
      <button className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-primary text-background rounded-full shadow-[0_10px_40px_rgba(129,236,255,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all md:hidden">
        <Save size={28} />
      </button>
    </div>
  );
}
