"use client";

import React, { useState, useTransition } from "react";
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
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { submitKycApplication } from "@/app/actions/auth";

const STEPS = [
  { id: 1, name: "Account Setup" },
  { id: 2, name: "Select Partners" },
  { id: 3, name: "KYC Details" },
  { id: 4, name: "Review & Submit" }
];

const BRANDS = [
  {
    id: "WinForLife",
    name: "WinForLife",
    desc: "High-roller focused platform with premium retention tools and exclusive VIP events for top referrers.",
    icon: <Building2 className="text-primary" size={32} />,
    color: "primary",
    perks: ["45% RevShare Base", "Monthly Milestone Bonuses"]
  },
  {
    id: "BIGWIN",
    name: "BIGWIN",
    desc: "The fastest growing mass-market casino in the PH. Excellent conversion rates for mobile traffic.",
    icon: <Dices className="text-secondary" size={32} />,
    color: "secondary",
    perks: ["50% CPA Commissions", "Local G-Cash Support"]
  },
  {
    id: "Rollem",
    name: "Rollem",
    desc: "Gen-Z focused social gaming ecosystem. High engagement metrics and community-driven rewards.",
    icon: <Gamepad2 className="text-tertiary" size={32} />,
    color: "tertiary",
    perks: ["Social Referral Engine", "Weekly Payouts"]
  }
];

export default function ApplyPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Step 1: Account Setup
  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    username: "",
    password: ""
  });

  // Step 3: KYC Details
  const [kycData, setKycData] = useState({
    telegram: "",
    location: "Metro Manila, PH"
  });
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!accountData.name || !accountData.email || !accountData.username || !accountData.password) {
        setError("Please fill in all required fields.");
        return;
      }
      if (accountData.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    }
    if (currentStep === 2 && selectedBrands.length === 0) {
      setError("Please select at least one partner platform.");
      return;
    }
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleSubmit = () => {
    setError(null);
    const formData = new FormData();
    formData.append("name", accountData.name);
    formData.append("email", accountData.email);
    formData.append("username", accountData.username);
    formData.append("password", accountData.password);
    formData.append("telegram", kycData.telegram);
    formData.append("location", kycData.location);
    if (idPhoto) formData.append("idPhoto", idPhoto);
    if (selfie) formData.append("selfie", selfie);
    formData.append("requestedBrands", JSON.stringify(selectedBrands));

    startTransition(async () => {
      const result = await submitKycApplication(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(result.error || "Submission failed. Please try again.");
      }
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-6 animate-vapor">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={48} className="text-emerald-400" />
          </div>
          <h1 className="text-4xl font-black font-headline text-on-surface">
            Application <span className="text-emerald-400">Submitted!</span>
          </h1>
          <p className="text-on-surface-variant max-w-md mx-auto">
            Your KYC application is now under review. Our CSR team will verify
            your details within 24–48 hours. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30">
      <header className="fixed top-0 right-0 w-full h-16 z-40 bg-[#060e20]/60 backdrop-blur-xl border-b border-[#81ecff]/10 flex justify-between items-center px-8">
        <Link href="/" className="flex items-center gap-4">
          <span className="text-lg font-black text-primary tracking-tight font-headline">
            Affiliate Hub PH
          </span>
        </Link>
        <Link
          href="/login"
          className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
        >
          Already Applied? Login
        </Link>
      </header>

      <main className="pt-28 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Progress Stepper */}
        <div className="mb-16">
          <div className="flex items-center justify-between max-w-4xl mx-auto relative">
            <div className="absolute top-5 left-0 w-full h-1 bg-surface-container-high z-0">
              <div
                className="h-full bg-gradient-to-r from-primary via-secondary to-surface-variant transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              ></div>
            </div>
            {STEPS.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 font-bold",
                    currentStep > step.id
                      ? "bg-primary text-background shadow-[0_0_15px_rgba(129,236,255,0.5)]"
                      : currentStep === step.id
                      ? "bg-primary text-background ring-4 ring-primary/20 shadow-[0_0_20px_rgba(129,236,255,0.4)]"
                      : "bg-surface-container-high border border-outline-variant text-on-surface-variant"
                  )}
                >
                  {currentStep > step.id ? <Check size={18} /> : step.id}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium font-headline tracking-wide transition-colors",
                    currentStep >= step.id ? "text-primary" : "text-on-surface-variant"
                  )}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1: Account Setup */}
        {currentStep === 1 && (
          <section className="max-w-2xl mx-auto animate-vapor space-y-8">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-3">
                Create Your Vault Account
              </h1>
              <p className="text-on-surface-variant leading-relaxed">
                This will be your login to the Affiliate Hub PH platform.
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">
                Full Name
              </label>
              <input
                type="text"
                value={accountData.name}
                onChange={(e) => setAccountData((d) => ({ ...d, name: e.target.value }))}
                className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline text-on-surface"
                placeholder="Juan Dela Cruz"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={accountData.email}
                  onChange={(e) => setAccountData((d) => ({ ...d, email: e.target.value }))}
                  className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline text-on-surface"
                  placeholder="juan@vault.ph"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">
                  Username
                </label>
                <input
                  type="text"
                  value={accountData.username}
                  onChange={(e) => setAccountData((d) => ({ ...d, username: e.target.value }))}
                  className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline text-on-surface"
                  placeholder="VaultMaster77"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={accountData.password}
                  onChange={(e) => setAccountData((d) => ({ ...d, password: e.target.value }))}
                  className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline text-on-surface font-mono"
                  placeholder="Min. 8 characters"
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
          </section>
        )}

        {/* Step 2: Brand Selection */}
        {currentStep === 2 && (
          <section className="animate-vapor">
            <div className="mb-12 text-center">
              <h1 className="text-3xl md:text-5xl font-extrabold font-headline tracking-tight text-on-surface mb-4">
                Choose Your Alliance
              </h1>
              <p className="text-on-surface-variant max-w-lg mx-auto text-lg leading-relaxed">
                Select the brands you wish to promote. Multi-select to maximize
                your earning potential.
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
                  <div
                    className={cn(
                      "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      selectedBrands.includes(brand.id)
                        ? "border-primary bg-primary text-background scale-110"
                        : "border-outline-variant"
                    )}
                  >
                    {selectedBrands.includes(brand.id) && (
                      <Check size={14} strokeWidth={4} />
                    )}
                  </div>
                  <div
                    className={cn(
                      "mb-6 h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                      brand.color === "primary"
                        ? "bg-primary/10"
                        : brand.color === "secondary"
                        ? "bg-secondary/10"
                        : "bg-tertiary/10"
                    )}
                  >
                    {brand.icon}
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-3 text-on-surface">
                    {brand.name}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                    {brand.desc}
                  </p>
                  <ul className="space-y-3">
                    {brand.perks.map((perk, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 text-sm font-medium text-primary"
                      >
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
              <h2 className="text-3xl font-bold font-headline text-on-surface mb-3">
                Vault Verification
              </h2>
              <p className="text-on-surface-variant text-lg">
                Provide your contact info and upload your identity documents.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">
                    Telegram Handle
                  </label>
                  <input
                    type="text"
                    value={kycData.telegram}
                    onChange={(e) => setKycData((d) => ({ ...d, telegram: e.target.value }))}
                    className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline text-on-surface"
                    placeholder="@juan_affiliate"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">
                    Location
                  </label>
                  <select
                    value={kycData.location}
                    onChange={(e) => setKycData((d) => ({ ...d, location: e.target.value }))}
                    className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface appearance-none"
                  >
                    <option>Metro Manila, PH</option>
                    <option>Cebu City, PH</option>
                    <option>Davao City, PH</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">
                    Government Issued ID
                  </label>
                  <input 
                    type="file" 
                    id="id-upload" 
                    className="hidden" 
                    accept="image/*,.pdf"
                    onChange={(e) => setIdPhoto(e.target.files?.[0] || null)}
                  />
                  <div 
                    onClick={() => document.getElementById('id-upload')?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer group",
                      idPhoto ? "border-primary bg-primary/5" : "border-outline-variant bg-surface-container-low/50 hover:bg-surface-container-high hover:border-primary/50"
                    )}
                  >
                    <UploadCloud
                      className={cn(
                        "mb-4 transition-colors",
                        idPhoto ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
                      )}
                      size={40}
                    />
                    <span className="text-sm font-bold text-on-surface mb-1 text-center">
                      {idPhoto ? idPhoto.name : "Click to upload or drag & drop"}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      PNG, JPG or PDF (Max 10MB)
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">
                    Selfie with ID
                  </label>
                  <input 
                    type="file" 
                    id="selfie-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setSelfie(e.target.files?.[0] || null)}
                  />
                  <div 
                    onClick={() => document.getElementById('selfie-upload')?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer group",
                      selfie ? "border-primary bg-primary/5" : "border-outline-variant bg-surface-container-low/50 hover:bg-surface-container-high hover:border-primary/50"
                    )}
                  >
                    <Camera
                      className={cn(
                        "mb-4 transition-colors",
                        selfie ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
                      )}
                      size={40}
                    />
                    <span className="text-sm font-bold text-on-surface mb-1 text-center">
                      {selfie ? selfie.name : "Capture or Upload Selfie"}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Face and ID must be clearly visible
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <section className="max-w-3xl mx-auto animate-vapor space-y-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold font-headline text-on-surface mb-3">
                Review & Confirm
              </h2>
              <p className="text-on-surface-variant">
                Please review your application before submitting.
              </p>
            </div>
            <GlassCard className="p-8 space-y-6 divide-y divide-white/5">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">
                  Account Details
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-on-surface-variant">Name</span>
                    <p className="font-bold text-on-surface">{accountData.name || "—"}</p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Email</span>
                    <p className="font-bold text-on-surface">{accountData.email || "—"}</p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Username</span>
                    <p className="font-bold text-on-surface">{accountData.username || "—"}</p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Telegram</span>
                    <p className="font-bold text-on-surface">{kycData.telegram || "—"}</p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Location</span>
                    <p className="font-bold text-on-surface">{kycData.location}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <span className="text-on-surface-variant">Documents</span>
                    <div className="flex gap-4">
                      {idPhoto && (
                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded">ID: {idPhoto.name}</span>
                      )}
                      {selfie && (
                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded">Selfie: {selfie.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">
                  Selected Platforms ({selectedBrands.length})
                </p>
                {selectedBrands.length === 0 ? (
                  <p className="text-on-surface-variant text-sm">No platforms selected.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {selectedBrands.map((b) => (
                      <span
                        key={b}
                        className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
            <p className="text-xs text-on-surface-variant text-center">
              By submitting, you agree to our Terms of Service. Your application
              will be reviewed by our CSR team within 24–48 hours.
            </p>
          </section>
        )}

        {/* Navigation */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-outline-variant/20 max-w-4xl mx-auto">
          <div />
          <div className="flex items-center gap-6">
            {currentStep > 1 && (
              <button
                onClick={() => {
                  setError(null);
                  setCurrentStep((prev) => prev - 1);
                }}
                className="px-10 py-4 rounded-full text-on-surface-variant font-bold hover:text-on-surface transition-all flex items-center gap-2"
              >
                <ChevronLeft size={20} /> Back
              </button>
            )}
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-12 py-5 rounded-full bg-primary text-background font-black font-headline tracking-wide shadow-[0_0_30px_rgba(129,236,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                Continue <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="px-12 py-5 rounded-full bg-primary text-background font-black font-headline tracking-wide shadow-[0_0_30px_rgba(129,236,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isPending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    SUBMITTING...
                  </>
                ) : (
                  <>
                    SUBMIT APPLICATION <Send size={20} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Floating Help */}
      <aside className="fixed right-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-6 animate-vapor">
        <GlassCard className="p-6 w-64 neon-glow-primary">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/20">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-primary tracking-widest">
                Support Agent
              </p>
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
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                Live Chat
              </p>
              <p className="text-xs font-medium text-on-surface-variant">
                System Status:{" "}
                <span className="text-green-400">Optimal</span>
              </p>
            </div>
          </div>
        </GlassCard>
      </aside>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-30"></div>
    </div>
  );
}
