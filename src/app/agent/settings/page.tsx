"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Bell, 
  Smartphone,
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function AgentSettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    affiliateUsername: user?.affiliateUsername || "",
    location: user?.location || "",
    mobileNumber: user?.mobileNumber || "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    setError(null);

    const { updateAgentProfile } = await import('@/app/actions/agent');
    const result = await updateAgentProfile(formData);
    
    setIsSaving(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Update failed.");
    }
  };

  return (
    <div className="animate-vapor space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-black font-headline text-on-surface tracking-tight uppercase">
          Nexus <span className="text-primary">Configuration</span>
        </h2>
        <p className="text-on-surface-variant mt-2 font-medium">
          Manage your vault security, communication nodes, and profile identity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sidebar Links */}
        <div className="space-y-2">
          {[
            { name: "General Profile", icon: <User size={18} />, active: true },
            { name: "Security & Auth", icon: <Shield size={18} />, active: false },
            { name: "Notifications", icon: <Bell size={18} />, active: false },
            { name: "Devices", icon: <Smartphone size={18} />, active: false },
          ].map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                item.active 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(129,236,255,0.1)]" 
                  : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <GlassCard className="p-8">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      Affiliate Hub Username
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
                      <input
                        type="text"
                        value={formData.affiliateUsername}
                        onChange={(e) => setFormData({...formData, affiliateUsername: e.target.value})}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary outline-none transition-all"
                        placeholder="VaultUser123"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface-variant/60 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-on-surface-variant/40 italic">Email cannot be changed after KYC approval.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      Primary Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary outline-none transition-all"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
                      <input
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary outline-none transition-all"
                        placeholder="+63 9xx xxx xxxx"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                {success && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-400/10 p-3 rounded-lg border border-emerald-400/20">
                    <CheckCircle2 size={14} /> Profile updated successfully.
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-primary text-background py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Transmit Updates
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Danger Zone */}
          <GlassCard className="p-8 border-red-500/10 bg-red-500/5">
            <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-4">Vault Decommission</h4>
            <p className="text-sm text-on-surface-variant/60 mb-6 leading-relaxed">
              Permanently delete your account and all associated vault credentials. This action is irreversible.
            </p>
            <button className="px-6 py-3 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all uppercase tracking-widest">
              Delete Account
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
