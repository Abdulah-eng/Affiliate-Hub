"use client";

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, Users, Activity, MousePointer2 } from "lucide-react";

interface AnalyticsData {
  date: string;
  visits: number;
  kycs: number;
}

export const DashboardCharts = ({ data }: { data: AnalyticsData[] }) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    // Small timeout to ensure container has settled in DOM
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-[450px]">
        <GlassCard className="h-[400px] flex items-center justify-center bg-slate-950/20">
          <Activity className="animate-pulse text-primary/10" size={48} />
        </GlassCard>
        <GlassCard className="h-[400px] flex items-center justify-center bg-slate-950/20">
          <TrendingUp className="animate-pulse text-emerald-500/10" size={48} />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-[450px] w-full min-w-0">
      {/* Website Visits Chart */}
      <GlassCard className="p-8 border-primary/10 bg-surface-container-low/30 backdrop-blur-2xl relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
           <MousePointer2 size={120} className="text-primary" />
        </div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h3 className="text-xl font-black text-on-surface uppercase tracking-tight flex items-center gap-3">
              <Activity className="text-primary" size={20} />
              Traffic Analytics
            </h3>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-1">Platform Visit Velocity (Last 30 Days)</p>
          </div>
          <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Real-time Node Monitoring</span>
          </div>
        </div>

        <div className="h-[300px] w-full mt-4 min-h-[300px] min-w-0" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
            {data && data.length > 0 ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#12F3FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#12F3FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6e9bff40" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#6e9bff80', fontWeight: 'bold' }}
                />
                <YAxis 
                  stroke="#6e9bff40" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#6e9bff80', fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#060e20', 
                    border: '1px solid rgba(129,236,255,0.2)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 0 30px rgba(18,243,255,0.1)'
                  }}
                  itemStyle={{ color: '#12F3FF' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#12F3FF" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVisits)" 
                  animationDuration={2000}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#12F3FF' }}
                />
              </AreaChart>
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20">No Data Available</div>
            )}
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* KYC Sign Ups Chart */}
      <GlassCard className="p-8 border-emerald-500/10 bg-surface-container-low/30 backdrop-blur-2xl relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
           <Users size={120} className="text-emerald-500" />
        </div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h3 className="text-xl font-black text-on-surface uppercase tracking-tight flex items-center gap-3">
              <TrendingUp className="text-emerald-500" size={20} />
              KYC Conversions
            </h3>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-1">Daily Agent Onboarding Trend</p>
          </div>
          <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Growth Metrics</span>
          </div>
        </div>

        <div className="h-[300px] w-full mt-4 min-h-[300px] min-w-0" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
            {data && data.length > 0 ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorKycs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#10b98140" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#10b98180', fontWeight: 'bold' }}
                />
                <YAxis 
                  stroke="#10b98140" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#10b98180', fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#060e20', 
                    border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 0 30px rgba(16,185,129,0.1)'
                  }}
                  itemStyle={{ color: '#10B981' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="kycs" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorKycs)" 
                  animationDuration={2500}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }}
                />
              </AreaChart>
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20">No Data Available</div>
            )}
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
};
