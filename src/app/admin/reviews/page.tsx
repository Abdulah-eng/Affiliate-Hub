"use client";

import React from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  UserCheck,
  ShieldAlert
} from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';

const APPLICATIONS = [
  { 
    id: 'AF-90210-PH', 
    name: 'Mateo Dela Cruz', 
    email: 'm.delacruz@example.ph', 
    status: 'Pending', 
    date: '2h ago', 
    score: 94,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbG0yWhgzHXyY2Xh69TZvxk7DtxSTvcDb0eWaCrfPoenCG59polTQvrbD4ySrasYI9Br9BjScdNysVx7da3aTHWcBa03zPEzS2DCqxIcwK7AA-lI_4yo1vwHJz8ksXYj4Cg8jV0-iRKL_Cn4eqtQX_wPt5RU4BHPbIe_B1aO6NiAt4PYlVXEOMKCcGx7z69wz2tcIbwu1p0cIPFVv5J0_U4rnKpjL2_9gj_tUdmIBpuVAk3fUcOKcj4PsCVNirQUaDhTWT98qF4Q4'
  },
  { 
    id: 'AF-88122-PH', 
    name: 'John Dela Cruz', 
    email: 'j.delacruz@mail.com', 
    status: 'In Review', 
    date: '5h ago', 
    score: 82,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgomtGZVpJrN6WHiySJcM1xgihHGqUXImYXqx3lv0bisgqLMgunSeIWk4Iwhfq6icbsHmI-mGpRPEtCYM39QRE7bkpYpKkPe8UdoMginQhMyfK8g4GKIsyUTHfjqcM1p9F5bNy9-O8koBFow7iBNnHMk1ti_vOCDS8GTlg0-8ZsDUeYoKn4dJQ8EvnBOLx-FrouSIjBo-BJ7BUiHk8_wQ5_iWfTmK-OJrXGwPQA_P6VNmvlbS2eXhZkuh46U0TgVIYIgvppHvRnfM'
  },
  { 
    id: 'AF-77211-PH', 
    name: 'Sarah Jenkins', 
    email: 's.jenkins@globex.com', 
    status: 'Flagged', 
    date: '1d ago', 
    score: 45,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrhNNC-2PWAtEkZzGo9Ff_u4_GUNTStKXUy-Zn0yJPIc-by_FoX5ZLLOqa3pujjfAw0HFf_kPgeaGCiQeq4x5F4IU3UtS6y9V04bKOAAlnrZFyl_y-1wRdLw1QFVqfQuHy6c1G154mqmP73QW1bz9zSSYE7kd1_ANnVjfQsU3Aw-zjTONQkX3bK8um70hINWou6KorLpTbDQXkr8rSdRJXg-5x8DlKafzfb3RUtGHiHW4adtqtSR3NmEF86xqBOwWN1Qm5Ad_4Pj8'
  }
];

export default function ReviewListPage() {
  return (
    <div className="animate-vapor">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface">
            Application <span className="text-primary">Reviews</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg font-medium">
            Monitor and process incoming affiliate requests. High-precision KYC validation at your fingertips.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-8 py-4 bg-primary text-background rounded-full hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] transition-all active:scale-95 font-bold uppercase tracking-widest text-xs">
            Review Next in Queue
          </button>
        </div>
      </div>

      {/* Filter HUD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <GlassCard className="p-4 flex items-center gap-4 bg-surface-container-low/40">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Pending</p>
            <p className="text-xl font-black text-on-surface">12</p>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center gap-4 bg-surface-container-low/40">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Approved (24h)</p>
            <p className="text-xl font-black text-on-surface">45</p>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center gap-4 bg-surface-container-low/40">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Flagged</p>
            <p className="text-xl font-black text-on-surface">03</p>
          </div>
        </GlassCard>
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
            <input 
              className="w-full h-full bg-surface-container-low/40 border border-outline-variant/30 focus:border-primary/50 text-sm rounded-2xl pl-12 pr-4 transition-all outline-none text-on-surface" 
              placeholder="Search ID/Name..." 
            />
          </div>
          <button className="p-4 bg-surface-container-high rounded-2xl text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Application Table */}
      <GlassCard className="rounded-2xl p-0 overflow-hidden border-primary/5 bg-surface-container-low/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Applicant</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Email Identifier</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Confidence</th>
                <th className="px-8 py-5 text-right pr-8 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {APPLICATIONS.map((app) => (
                <tr key={app.id} className="group hover:bg-white/5 transition-colors duration-500">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-primary/20 bg-surface-container-high flex-shrink-0">
                        <img src={app.avatar} alt={app.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-black text-on-surface font-headline tracking-tight text-base">{app.name}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{app.id} • {app.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-on-surface-variant">{app.email}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-full border w-fit font-black uppercase tracking-widest text-[10px]",
                      app.status === 'Pending' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
                      app.status === 'In Review' ? "bg-primary/10 text-primary border-primary/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        app.status === 'Pending' ? "bg-amber-500" : app.status === 'In Review' ? "bg-primary" : "bg-red-500"
                      )}></span>
                      {app.status}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full", 
                            app.score > 90 ? "bg-emerald-500" : app.score > 70 ? "bg-primary" : "bg-red-500"
                          )} 
                          style={{ width: `${app.score}%` }} 
                        />
                      </div>
                      <span className="text-xs font-black text-on-surface">{app.score}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link 
                      href={`/admin/reviews/${app.id}`}
                      className="px-6 py-2.5 bg-surface-container-high hover:bg-primary text-on-surface-variant hover:text-background border border-outline-variant/30 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 inline-flex items-center gap-2"
                    >
                      Process <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
