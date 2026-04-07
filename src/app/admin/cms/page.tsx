"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Layout, 
  Video, 
  Image as ImageIcon, 
  Upload, 
  Save, 
  RefreshCcw, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Type,
  Hash,
  List,
  Target,
  Zap,
  Layers,
  ChevronRight
} from "lucide-react";
import { cn } from '@/lib/utils';
import { getSystemSettings, updateSystemSettings, uploadCmsAsset } from '@/app/actions/admin';

type CMSItem = {
  key: string;
  label: string;
  type: 'TEXT' | 'TEXTAREA' | 'VIDEO' | 'IMAGE';
  desc: string;
};

const SECTIONS = [
  { id: 'hero', label: 'Hero Section', icon: <Target size={18} /> },
  { id: 'stats', label: 'Network Stats', icon: <Hash size={18} /> },
  { id: 'features', label: 'Features (Bento)', icon: <Layers size={18} /> },
  { id: 'partners', label: 'Partner Network', icon: <List size={18} /> },
  { id: 'workflow', label: 'Workflow (HIW)', icon: <Zap size={18} /> },
  { id: 'cta', label: 'CTA & Footer', icon: <ChevronRight size={18} /> },
];

const CMS_MAP: Record<string, CMSItem[]> = {
  hero: [
    { key: 'CMS_HERO_VIDEO', label: 'Background Video', type: 'VIDEO', desc: 'Atmospheric video for the background.' },
    { key: 'CMS_HERO_TITLE', label: 'Main Headline', type: 'TEXT', desc: 'Primary landing title.' },
    { key: 'CMS_HERO_DESC', label: 'Sub-headline', type: 'TEXTAREA', desc: 'Catch-phrase description under the title.' },
    { key: 'CMS_HERO_BADGE', label: 'Status Badge', type: 'TEXT', desc: 'Floating badge text (e.g., "System Online").' },
    { key: 'CMS_HERO_CARD_VAL', label: 'Card Primary Stat', type: 'TEXT', desc: 'Main percentage/value in the glass card.' },
    { key: 'CMS_HERO_CARD_LBL', label: 'Card Stat Label', type: 'TEXT', desc: 'Label for the main percentage.' },
  ],
  stats: [
    { key: 'CMS_STATS_VAL1', label: 'Stat 1 Value', type: 'TEXT', desc: 'Big number for the first stat (e.g., 100+).' },
    { key: 'CMS_STATS_LBL1', label: 'Stat 1 Label', type: 'TEXT', desc: 'Description for stat 1.' },
    { key: 'CMS_STATS_VAL2', label: 'Stat 2 Value', type: 'TEXT', desc: 'Big number for the second stat (e.g., 5,000+).' },
    { key: 'CMS_STATS_LBL2', label: 'Stat 2 Label', type: 'TEXT', desc: 'Description for stat 2.' },
    { key: 'CMS_STATS_VAL3', label: 'Stat 3 Value', type: 'TEXT', desc: 'Big number for the third stat (e.g., 95%).' },
    { key: 'CMS_STATS_LBL3', label: 'Stat 3 Label', type: 'TEXT', desc: 'Description for stat 3.' },
  ],
  features: [
    { key: 'CMS_FEAT_TITLE', label: 'Section Title', type: 'TEXT', desc: 'Heading for the features section.' },
    { key: 'CMS_FEAT_SUBTITLE', label: 'Section Subtitle', type: 'TEXT', desc: 'Supporting text for features heading.' },
    { key: 'CMS_FEAT1_TITLE', label: 'Feature 1 Title', type: 'TEXT', desc: 'Heading for the first bento card.' },
    { key: 'CMS_FEAT1_DESC', label: 'Feature 1 Description', type: 'TEXTAREA', desc: 'Body text for the first card.' },
    { key: 'CMS_BENTO_IMAGE_1', label: 'Feature Image Asset', type: 'IMAGE', desc: 'Visual for the insight card.' },
    { key: 'CMS_FEAT2_TITLE', label: 'Feature 2 (KYC)', type: 'TEXT', desc: 'Heading for the verification card.' },
    { key: 'CMS_FEAT2_DESC', label: 'Feature 2 Description', type: 'TEXTAREA', desc: 'Body text for verification.' },
  ],
  partners: [
    { key: 'CMS_PARTNERS_LABEL', label: 'Section Label', type: 'TEXT', desc: 'Text above the brand list.' },
    { key: 'CMS_PARTNERS_LIST', label: 'Partner Names', type: 'TEXT', desc: 'Comma separated list of partner brands.' },
  ],
  workflow: [
    { key: 'CMS_HIW_TITLE', label: 'Section Title', type: 'TEXT', desc: 'Heading for HIW section.' },
    { key: 'CMS_HIW_STEP1_TITLE', label: 'Step 1 Title', type: 'TEXT', desc: 'Heading for the first step.' },
    { key: 'CMS_HIW_STEP1_DESC', label: 'Step 1 Description', type: 'TEXTAREA', desc: 'Instructions for step 1.' },
    { key: 'CMS_HIW_STEP2_TITLE', label: 'Step 2 Title', type: 'TEXT', desc: 'Heading for the second step.' },
    { key: 'CMS_HIW_STEP2_DESC', label: 'Step 2 Description', type: 'TEXTAREA', desc: 'Instructions for step 2.' },
    { key: 'CMS_HIW_STEP3_TITLE', label: 'Step 3 Title', type: 'TEXT', desc: 'Heading for the third step.' },
    { key: 'CMS_HIW_STEP3_DESC', label: 'Step 3 Description', type: 'TEXTAREA', desc: 'Instructions for step 3.' },
  ],
  cta: [
    { key: 'CMS_CTA_TITLE', label: 'CTA Heading', type: 'TEXT', desc: 'Big call to action title at the bottom.' },
    { key: 'CMS_CTA_DESC', label: 'CTA Description', type: 'TEXTAREA', desc: 'Body text for the CTA section.' },
    { key: 'CMS_CTA_BTN_PRIMARY', label: 'Primary Button Label', type: 'TEXT', desc: 'Text for "Apply Now" style buttons.' },
    { key: 'CMS_CTA_BTN_SECONDARY', label: 'Secondary Button Label', type: 'TEXT', desc: 'Text for "Support" style buttons.' },
  ]
};

export default function AdminCmsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const [isPending, startTransition] = useTransition();
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    const data = await getSystemSettings();
    const settingsMap = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    setSettings(settingsMap);
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFileUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", key);

    const result = await uploadCmsAsset(formData);
    if (result.success) {
      setSettings(prev => ({ ...prev, [key]: result.url! }));
      setStatus({ type: 'success', message: `Asset uploaded for ${key}` });
    } else {
      setStatus({ type: 'error', message: result.error || 'Upload failed' });
    }
    setUploadingKey(null);
    setTimeout(() => setStatus(null), 3000);
  };

  const updateVal = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = () => {
    startTransition(async () => {
      const res = await updateSystemSettings(settings);
      if (res.success) {
        setStatus({ type: 'success', message: 'All changes deployed to landing page.' });
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus({ type: 'error', message: res.error || 'Failed to save changes.' });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-vapor max-w-7xl mx-auto pb-32">
      {/* Header Overlay */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-4 py-1.5 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-secondary/20">Omni-Content Manager</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
          Nexus <span className="text-secondary tracking-normal">CMS</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg font-medium mt-4">
          Modify every word, data point, and visual asset on the Affiliate Hub home page instantly.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:w-72 w-full space-y-2 lg:sticky lg:top-32 h-fit">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all border",
                activeSection === section.id 
                  ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_20px_rgba(129,236,255,0.1)]" 
                  : "bg-surface-container-low/40 text-on-surface-variant border-transparent hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              {section.icon}
              {section.label}
              {activeSection === section.id && <div className="ml-auto w-1.5 h-6 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-8 w-full">
          {status && (
            <div className={cn(
              "p-4 rounded-2xl flex items-center gap-3 animate-shake border",
              status.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
            )}>
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-bold">{status.message}</span>
            </div>
          )}

          <div className="space-y-6">
            {CMS_MAP[activeSection].map((item) => (
              <GlassCard key={item.key} className="p-8 border-white/5 bg-surface-container-lowest/30 group">
                <div className="flex flex-col gap-6">
                  {/* Label & Description */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-on-surface uppercase tracking-tight text-lg mb-1">{item.label}</h3>
                      <p className="text-xs text-on-surface-variant font-medium">{item.desc}</p>
                    </div>
                    <span className="px-3 py-1 bg-white/5 rounded text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{item.key}</span>
                  </div>

                  {/* Inputs */}
                  {item.type === 'TEXT' && (
                    <div className="relative">
                      <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                      <input 
                        type="text" 
                        value={settings[item.key] || ""} 
                        onChange={(e) => updateVal(item.key, e.target.value)}
                        placeholder="System default text..."
                        className="w-full bg-surface-container/30 border border-outline-variant/20 rounded-2xl px-12 py-5 text-sm font-bold text-on-surface outline-none focus:border-primary transition-all"
                      />
                    </div>
                  )}

                  {item.type === 'TEXTAREA' && (
                    <textarea 
                      value={settings[item.key] || ""} 
                      onChange={(e) => updateVal(item.key, e.target.value)}
                      placeholder="Enter multi-line description..."
                      rows={3}
                      className="w-full bg-surface-container/30 border border-outline-variant/20 rounded-2xl px-6 py-5 text-sm font-bold text-on-surface outline-none focus:border-primary transition-all resize-none"
                    />
                  )}

                  {(item.type === 'IMAGE' || item.type === 'VIDEO') && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-black/20 p-6 rounded-3xl border border-white/5">
                      <div className="md:col-span-4 relative aspect-video rounded-xl bg-surface-container overflow-hidden">
                        {settings[item.key] ? (
                          item.type === 'VIDEO' ? (
                            <video src={settings[item.key]} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={settings[item.key]} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><ImageIcon size={32} /></div>
                        )}
                        {uploadingKey === item.key && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-primary"><Loader2 className="animate-spin" /></div>
                        )}
                      </div>
                      <div className="md:col-span-8 space-y-4">
                        <input 
                          type="text" 
                          value={settings[item.key] || ""} 
                          onChange={(e) => updateVal(item.key, e.target.value)}
                          placeholder="Direct URL (https://...)"
                          className="w-full bg-surface-container/30 border border-outline-variant/20 rounded-xl px-4 py-3 text-xs font-bold text-on-surface outline-none focus:border-primary transition-all"
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            accept={item.type === 'VIDEO' ? 'video/*' : 'image/*'} 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(item.key, e.target.files[0])}
                          />
                          <button className="flex items-center gap-2 px-8 py-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/20 hover:scale-[1.02] transition-all w-fit">
                            <Upload size={14} /> Local Upload
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* Deploy Actions */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={handleSaveAll}
          disabled={isPending}
          className="flex items-center gap-4 px-16 py-6 bg-secondary text-background border border-secondary/20 rounded-full font-black uppercase tracking-[0.4em] text-sm shadow-[0_0_60px_rgba(166,140,255,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Deploy to Production
        </button>
      </div>
    </div>
  );
}
