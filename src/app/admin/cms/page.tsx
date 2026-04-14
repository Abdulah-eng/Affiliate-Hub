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
  ChevronRight,
  Plus,
  MonitorPlay
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
  { id: 'earn', label: 'Earn Tutorial', icon: <MonitorPlay size={18} /> },
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
    { key: 'CMS_PARTNERS_LABEL', label: 'Section Label', type: 'TEXT', desc: 'Text above the brand logos row.' },
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
  ],
  earn: [
    { key: 'CMS_EARN_VIDEO', label: 'Tutorial Video', type: 'VIDEO', desc: 'Main protocol tutorial video for agents.' },
    { key: 'CMS_EARN_TITLE', label: 'Banner Title', type: 'TEXT', desc: 'Headline for the tutorial tab.' },
    { key: 'CMS_EARN_DESC', label: 'Banner Description', type: 'TEXTAREA', desc: 'Body text for the earning instructions.' },
  ]
};

export default function AdminCmsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const [isPending, startTransition] = useTransition();
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [partners, setPartners] = useState<{name: string; logo: string}[]>([]);
  const [newPartnerName, setNewPartnerName] = useState("");
  
  // Earn Tutorials
  const [earnSteps, setEarnSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState("");
  const [earnTips, setEarnTips] = useState<{label: string; text: string}[]>([]);
  const [newTip, setNewTip] = useState({ label: "", text: "" });

  const fetchSettings = async () => {
    setLoading(true);
    const data = await getSystemSettings();
    const settingsMap = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);
    setSettings(settingsMap);
    // Parse partner JSON
    try {
      const pJson = settingsMap['CMS_PARTNERS_JSON'];
      if (pJson) setPartners(JSON.parse(pJson));
      else {
        // Fallback: migrate from comma-separated list
        const list = (settingsMap['CMS_PARTNERS_LIST'] || '').split(',').map(s => s.trim()).filter(Boolean);
        setPartners(list.map(name => ({ name, logo: '' })));
      }
    } catch { setPartners([]); }
    try {
      const stepsJson = settingsMap['CMS_EARN_STEPS_JSON'];
      if (stepsJson) setEarnSteps(JSON.parse(stepsJson));
      const tipsJson = settingsMap['CMS_EARN_TIPS_JSON'];
      if (tipsJson) setEarnTips(JSON.parse(tipsJson));
    } catch { 
      setEarnSteps([]);
      setEarnTips([]);
    }
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
      // Merge JSONs into settings before saving
      const merged = { 
        ...settings, 
        CMS_PARTNERS_JSON: JSON.stringify(partners),
        CMS_EARN_STEPS_JSON: JSON.stringify(earnSteps),
        CMS_EARN_TIPS_JSON: JSON.stringify(earnTips)
      };
      const res = await updateSystemSettings(merged);
      if (res.success) {
        setStatus({ type: 'success', message: 'All changes deployed to production.' });
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus({ type: 'error', message: res.error || 'Failed to save changes.' });
      }
    });
  };

  const handlePartnerLogoUpload = async (index: number, file: File) => {
    const key = `CMS_PARTNER_LOGO_${index}`;
    setUploadingKey(key);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", key);
    const result = await uploadCmsAsset(formData);
    if (result.success) {
      setPartners(prev => prev.map((p, i) => i === index ? { ...p, logo: result.url! } : p));
    } else {
      setStatus({ type: 'error', message: 'Logo upload failed.' });
    }
    setUploadingKey(null);
  };

  const addPartner = () => {
    if (!newPartnerName.trim()) return;
    setPartners(prev => [...prev, { name: newPartnerName.trim(), logo: '' }]);
    setNewPartnerName('');
  };

  const removePartner = (index: number) => {
    setPartners(prev => prev.filter((_, i) => i !== index));
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
                            settings[item.key].includes('youtube.com') || settings[item.key].includes('youtu.be') ? (
                              <iframe 
                                src={`https://www.youtube.com/embed/${settings[item.key].match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|u\/\w\/))([^\?&"'>]+)/)?.[1]}?autoplay=1&mute=1&controls=0&loop=1`} 
                                className="w-full h-full border-0 pointer-events-none"
                                title="YouTube Preview"
                              />
                            ) : (
                              <video src={settings[item.key]} className="w-full h-full object-cover" muted />
                            )
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

          {/* Special Partners Manager */}
          {activeSection === 'partners' && (
            <GlassCard className="p-8 border-white/5 bg-surface-container-lowest/30">
              <h3 className="font-black text-on-surface uppercase tracking-tight text-lg mb-1">Partner Logos</h3>
              <p className="text-xs text-on-surface-variant font-medium mb-6">Add partner brands with logos. Each logo appears in the partner network row on the home page.</p>
              
              {/* Add new partner */}
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPartner()}
                  placeholder="Partner name (e.g. WinForLife)"
                  className="flex-1 bg-surface-container/30 border border-outline-variant/20 rounded-xl px-4 py-3 text-sm font-bold text-on-surface outline-none focus:border-primary transition-all"
                />
                <button onClick={addPartner} disabled={!newPartnerName.trim()} className="flex items-center gap-2 px-5 py-3 bg-primary/20 border border-primary/30 text-primary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/30 transition-all disabled:opacity-40">
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Partners list */}
              <div className="space-y-3">
                {partners.length === 0 && (
                  <p className="text-center text-on-surface-variant/40 py-8 text-sm">No partners added yet.</p>
                )}
                {partners.map((partner, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-surface-container/30 rounded-xl border border-outline-variant/10">
                    {/* Logo preview */}
                    <div className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {partner.logo ? (
                        <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-lg font-black text-primary/30">{partner.name[0]}</span>
                      )}
                    </div>
                    {/* Name */}
                    <input
                      type="text"
                      value={partner.name}
                      onChange={(e) => setPartners(prev => prev.map((p, idx) => idx === i ? { ...p, name: e.target.value } : p))}
                      className="flex-1 bg-transparent border-b border-outline-variant/20 focus:border-primary pb-1 text-sm font-bold text-on-surface outline-none transition-all"
                    />
                    {/* Logo upload and URL */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 w-full sm:w-auto">
                      <div className="relative w-full sm:w-64">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={14} />
                        <input 
                          type="text"
                          value={partner.logo}
                          onChange={(e) => setPartners(prev => prev.map((p, idx) => idx === i ? { ...p, logo: e.target.value } : p))}
                          placeholder="Logo URL (Direct Link)"
                          className="w-full bg-surface-container/50 border border-outline-variant/10 rounded-lg pl-9 pr-3 py-2 text-[10px] font-bold text-on-surface outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div className="relative flex-shrink-0 w-full sm:w-auto">
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" onChange={(e) => e.target.files?.[0] && handlePartnerLogoUpload(i, e.target.files[0])} />
                        <button className="flex items-center justify-center gap-1 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all w-full sm:w-auto">
                          {uploadingKey === `CMS_PARTNER_LOGO_${i}` ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                          Upload Local
                        </button>
                      </div>
                    </div>
                    {/* Delete */}
                    <button onClick={() => removePartner(i)} className="p-2 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Earn Tutorial Manager */}
          {activeSection === 'earn' && (
            <div className="space-y-8">
              {/* Steps Manager */}
              <GlassCard className="p-8 border-white/5 bg-surface-container-lowest/30">
                <h3 className="font-black text-on-surface uppercase tracking-tight text-lg mb-1 flex items-center gap-2">
                  <List size={20} className="text-secondary" /> Execution Steps
                </h3>
                <p className="text-xs text-on-surface-variant font-medium mb-6">Define the step-by-step instructions for agents to start earning.</p>
                
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (setEarnSteps(p => [...p, newStep]), setNewStep(""))}
                    placeholder="Describe a step (e.g. Share link to FB)"
                    className="flex-1 bg-surface-container/30 border border-outline-variant/20 rounded-xl px-4 py-3 text-sm font-bold text-on-surface outline-none focus:border-secondary transition-all"
                  />
                  <button onClick={() => {setEarnSteps(p => [...p, newStep]); setNewStep("");}} disabled={!newStep.trim()} className="flex items-center gap-2 px-5 py-3 bg-secondary/20 border border-secondary/30 text-secondary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-secondary/30 transition-all disabled:opacity-40">
                    <Plus size={14} /> Add Step
                  </button>
                </div>

                <div className="space-y-2">
                  {earnSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-surface-container/30 rounded-xl border border-outline-variant/10 group">
                      <span className="w-6 h-6 rounded bg-secondary/10 flex items-center justify-center text-[10px] font-black text-secondary shrink-0">{i+1}</span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => setEarnSteps(prev => prev.map((s, idx) => idx === i ? e.target.value : s))}
                        className="flex-1 bg-transparent text-sm font-bold text-on-surface outline-none"
                      />
                      <button onClick={() => setEarnSteps(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Tips Manager */}
              <GlassCard className="p-8 border-white/5 bg-surface-container-lowest/30">
                <h3 className="font-black text-on-surface uppercase tracking-tight text-lg mb-1 flex items-center gap-2">
                  <Zap size={20} className="text-secondary" /> Pro-Tips
                </h3>
                <p className="text-xs text-on-surface-variant font-medium mb-6">Add specialized advice with bold labels to help agents perform better.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <input
                    type="text"
                    value={newTip.label}
                    onChange={(e) => setNewTip(p => ({...p, label: e.target.value}))}
                    placeholder="Bold Label (e.g. TIP)"
                    className="bg-surface-container/30 border border-outline-variant/20 rounded-xl px-4 py-3 text-sm font-bold text-on-surface outline-none focus:border-secondary transition-all"
                  />
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newTip.text}
                      onChange={(e) => setNewTip(p => ({...p, text: e.target.value}))}
                      placeholder="Tip Description..."
                      className="flex-1 bg-surface-container/30 border border-outline-variant/20 rounded-xl px-4 py-3 text-sm font-bold text-on-surface outline-none focus:border-secondary transition-all"
                    />
                    <button onClick={() => {setEarnTips(p => [...p, newTip]); setNewTip({label:"", text:""});}} disabled={!newTip.label || !newTip.text} className="flex items-center gap-2 px-5 py-3 bg-secondary/20 border border-secondary/30 text-secondary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-secondary/30 transition-all disabled:opacity-40">
                      <Plus size={14} /> Add Tip
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {earnTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-surface-container/30 rounded-xl border border-outline-variant/10 group">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={tip.label}
                          onChange={(e) => setEarnTips(prev => prev.map((t, idx) => idx === i ? {...t, label: e.target.value} : t))}
                          className="bg-secondary/10 px-2 py-0.5 rounded text-[10px] font-black text-secondary uppercase outline-none"
                        />
                        <textarea
                          value={tip.text}
                          rows={2}
                          onChange={(e) => setEarnTips(prev => prev.map((t, idx) => idx === i ? {...t, text: e.target.value} : t))}
                          className="w-full bg-transparent text-xs font-medium text-on-surface-variant outline-none resize-none"
                        />
                      </div>
                      <button onClick={() => setEarnTips(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}
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
