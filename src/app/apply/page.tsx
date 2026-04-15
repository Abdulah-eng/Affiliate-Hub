"use client";

import React, { useState, useEffect, useTransition } from "react";
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
  EyeOff,
  Rocket,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { submitKycApplication } from "@/app/actions/auth";
import { signIn } from "next-auth/react";

const STEPS = [
  { id: 1, name: "Account" },
  { id: 2, name: "Profile" },
  { id: 3, name: "Affiliate" },
  { id: 4, name: "Verification" },
  { id: 5, name: "Review" }
];

const BRANDS = [
  { id: "POTS", name: "Pearl Of The Seas (POTS)", status: "ACTIVE" },
  { id: "WinForLife", name: "Win For Life", status: "ACTIVE" },
  { id: "Rollem", name: "Rollem", status: "ACTIVE" },
  { id: "TAMASA", name: "TAMASA", status: "ACTIVE" },
  { id: "COW", name: "COW", status: "ACTIVE" },
  { id: "MegaPerya", name: "Mega Perya", status: "COMING_SOON" },
  { id: "BIGWIN", name: "BIGWIN", status: "UNAVAILABLE" },
  { id: "SupremeGaming", name: "Supreme-Gaming", status: "UNAVAILABLE" },
  { id: "PeryaPlay", name: "Perya Play", status: "COMING_SOON" },
];

const PRIMARY_IDS = [
  "PhilSys National ID", "Passport", "Driver’s License", 
  "UMID (SSS / GSIS)", "PRC ID", "Postal ID (new version)", 
  "Voter’s ID (older but still accepted)"
];

const SECONDARY_IDS = [
  "PhilHealth ID", "TIN ID", "Barangay Clearance", 
  "Police Clearance", "Birth Certificate (PSA)"
];

const REFERRAL_SOURCES = [
  "Facebook Page", "Facebook Group", "Facebook Ads / Sponsored Post",
  "Messenger Community Chat", "Referral from a Friend / Family / Other Agent"
];

import { KycDisclaimer } from "@/components/kyc/KycDisclaimer";
import { IdUploadField } from "@/components/kyc/IdUploadField";
import { SupportWidget } from "@/components/support/SupportWidget";

import { Suspense } from "react";

function ApplyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");
  const [isPending, startTransition] = useTransition();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [referralSource, setReferralSource] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Verification Logic State
  const [verificationMode, setVerificationMode] = useState<"PRIMARY" | "SECONDARY">("PRIMARY");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showInitialAd, setShowInitialAd] = useState(false);

  useEffect(() => {
    // Show ad on initial load
    const timer = setTimeout(() => setShowInitialAd(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleApply = async () => {
    setGoogleLoading(true);
    const callbackUrl = referralCode ? `/apply/kyc?ref=${referralCode}` : "/apply/kyc";
    await signIn("google", { callbackUrl });
  };

  // Step 1: Account Setup
  const [accountData, setAccountData] = useState({
    email: "",
    username: "",
    password: ""
  });

  // Step 2: Personal Details
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    fbProfileName: "",
    mobileNumber: "",
    city: "",
    address: "",
    affiliateUsername: "",
    location: ""
  });

  // Step 4: Verification Data
  const [kycFiles, setKycFiles] = useState<Record<string, File | null>>({
    idPhoto: null,
    idBack: null,
    secondaryId1Front: null,
    secondaryId1Back: null,
    secondaryId2Front: null,
    secondaryId2Back: null,
    selfie: null
  });

  const [kycMetaData, setKycMetaData] = useState({
    idType: "",
    idNumber: "",
    secondaryId1Type: "",
    secondaryId1Number: "",
    secondaryId2Type: "",
    secondaryId2Number: ""
  });

  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const toggleReferral = (id: string) => {
    setReferralSource((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      if (!accountData.email || !accountData.username || !accountData.password) {
        setError("Account credentials are required.");
        return;
      }
    }
    if (currentStep === 2) {
      if (!profileData.firstName || !profileData.lastName || !profileData.mobileNumber || !profileData.city || !profileData.affiliateUsername) {
        setError("Profile details and Affiliate Hub Username are required.");
        return;
      }
    }
    if (currentStep === 3) {
      if (selectedBrands.length === 0) {
        setError("Please select at least one affiliate program.");
        return;
      }
    }
    if (currentStep === 4) {
      if (verificationMode === "PRIMARY") {
        if (!kycMetaData.idType) { setError("Please select a Primary ID Type."); return; }
        if (!kycMetaData.idNumber) { setError("Please enter your Primary ID Number."); return; }
        if (!kycFiles.idPhoto) { setError("Please upload the Front view of your ID."); return; }
        if (!kycFiles.selfie) { setError("A Selfie with your ID is required for verification."); return; }
      } else {
        if (!kycMetaData.secondaryId1Type || !kycFiles.secondaryId1Front) { setError("The first Secondary ID and its photo are required."); return; }
        if (!kycMetaData.secondaryId2Type || !kycFiles.secondaryId2Front) { setError("The second Secondary ID and its photo are required."); return; }
        if (!kycFiles.selfie) { setError("A Selfie with your ID is required for verification."); return; }
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleSubmit = () => {
    if (!agreedToTerms) {
      setError("You must agree to the KYC verification terms.");
      return;
    }

    const formData = new FormData();
    // Step 1
    formData.append("email", accountData.email);
    formData.append("username", accountData.username);
    formData.append("password", accountData.password);
    
    // Step 2
    Object.entries(profileData).forEach(([key, val]) => formData.append(key, val));
    
    // Step 3
    formData.append("requestedBrands", JSON.stringify(selectedBrands));
    formData.append("referralSource", JSON.stringify(referralSource));
    
    // Step 4
    formData.append("verificationMode", verificationMode);
    formData.append("idType", kycMetaData.idType);
    formData.append("idNumber", kycMetaData.idNumber);
    formData.append("secondaryId1Type", kycMetaData.secondaryId1Type);
    formData.append("secondaryId1Number", kycMetaData.secondaryId1Number);
    formData.append("secondaryId2Type", kycMetaData.secondaryId2Type);
    formData.append("secondaryId2Number", kycMetaData.secondaryId2Number);
    
    // Files
    Object.entries(kycFiles).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    formData.append("agreedToTerms", "true");
    if (referralCode) formData.append("referrerCode", referralCode);

    startTransition(async () => {
      const result = await submitKycApplication(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 5000);
      } else {
        setError(result.error || "Submission failed.");
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
            Application <span className="text-emerald-400">Success!</span>
          </h1>
          <p className="text-on-surface-variant max-w-md mx-auto">
            Your comprehensive KYC application is being processed. 
            Verification takes 24–48 hours. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30">
      <header className="fixed top-0 right-0 w-full h-24 z-40 bg-[#060e20]/60 backdrop-blur-xl border-b border-[#81ecff]/10 flex justify-between items-center px-8">
        <div className="flex items-center gap-20">
          <Link href="/" className="relative h-20 w-48 flex items-center justify-center ml-12">
            <img 
              src="/WhatsApp_Image_2026-04-11_at_01.17.27-removebg-preview.png" 
              alt="Logo" 
              className="absolute max-w-none h-32 w-auto object-contain scale-[2.25] -translate-x-4" 
            />
          </Link>
        </div>
        <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
          Already Applied? Login
        </Link>
      </header>

      <main className="pt-28 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Google Sign-In — Recommended Path */}
        <div className="max-w-2xl mx-auto mb-12 p-6 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-1">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Recommended</p>
            <h3 className="font-black text-on-surface text-lg">Sign in with Google to apply faster</h3>
            <p className="text-on-surface-variant text-sm mt-1">No password needed — your Google account becomes your login. Just fill in KYC details after signing in.</p>
          </div>
          <button onClick={handleGoogleApply} disabled={googleLoading}
            className="flex items-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-60 flex-shrink-0 shadow-lg">
            {googleLoading ? <Loader2 size={18} className="animate-spin" /> : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>
        </div>

        <div className="flex items-center gap-4 max-w-2xl mx-auto mb-10">
          <div className="flex-1 h-px bg-outline-variant/20" />
          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">or apply manually below</span>
          <div className="flex-1 h-px bg-outline-variant/20" />
        </div>

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
                <span className={cn("text-[10px] font-bold font-headline uppercase tracking-widest transition-colors", currentStep >= step.id ? "text-primary" : "text-on-surface-variant")}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8 flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-shake">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Dynamic Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Account Setup */}
          {currentStep === 1 && (
            <div className="animate-vapor space-y-8">
              <div>
                <h1 className="text-3xl font-black font-headline text-on-surface mb-2">Initialize Your Account</h1>
                <p className="text-on-surface-variant">Step 1: Set your primary login credentials.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData(d => ({...d, email: e.target.value}))}
                    className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant focus:border-primary outline-none transition-all text-on-surface"
                    placeholder="name@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Username</label>
                  <input
                    type="text"
                    value={accountData.username}
                    onChange={(e) => setAccountData(d => ({...d, username: e.target.value}))}
                    className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant focus:border-primary outline-none transition-all text-on-surface"
                    placeholder="VaultUser123"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Create Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={accountData.password}
                      onChange={(e) => setAccountData(d => ({...d, password: e.target.value}))}
                      className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant focus:border-primary outline-none transition-all text-on-surface"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Details */}
          {currentStep === 2 && (
            <div className="animate-vapor space-y-8">
              <div>
                <h1 className="text-3xl font-black font-headline text-on-surface mb-2">Profile Information</h1>
                <p className="text-on-surface-variant">Step 2: Tell us more about yourself for faster approval.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="First Name *"
                  className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant outline-none"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(d => ({...d, firstName: e.target.value}))}
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant outline-none"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(d => ({...d, lastName: e.target.value}))}
                />
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Affiliate Hub Username *</label>
                  <input
                    type="text"
                    placeholder="VaultUser123"
                    className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant outline-none focus:border-primary transition-all shadow-inner"
                    value={profileData.affiliateUsername}
                    onChange={(e) => setProfileData(d => ({...d, affiliateUsername: e.target.value}))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Mobile Number *</label>
                  <input
                    type="text"
                    placeholder="0917XXXXXXX"
                    className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant outline-none focus:border-primary"
                    value={profileData.mobileNumber}
                    onChange={(e) => setProfileData(d => ({...d, mobileNumber: e.target.value}))}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Facebook Profile Name *"
                  className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant outline-none md:col-span-2"
                  value={profileData.fbProfileName}
                  onChange={(e) => setProfileData(d => ({...d, fbProfileName: e.target.value}))}
                />
                <input
                  type="text"
                  placeholder="City (e.g., Cebu, Davao, Quezon City) *"
                  className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant outline-none"
                  value={profileData.city}
                  onChange={(e) => setProfileData(d => ({...d, city: e.target.value}))}
                />
                <input
                  type="text"
                  placeholder="Location / Region *"
                  className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant outline-none"
                  value={profileData.location}
                  onChange={(e) => setProfileData(d => ({...d, location: e.target.value}))}
                />
                <textarea
                  placeholder="Full Address"
                  className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant outline-none md:col-span-2 min-h-[100px]"
                  value={profileData.address}
                  onChange={(e) => setProfileData(d => ({...d, address: e.target.value}))}
                />
              </div>
            </div>
          )}

          {/* Step 3: Affiliate & Referral */}
          {currentStep === 3 && (
            <div className="animate-vapor space-y-12">
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-headline text-primary border-l-4 border-primary pl-4 uppercase tracking-widest">
                  Affiliate Programs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {BRANDS.map(brand => (
                    <div
                      key={brand.id}
                      onClick={() => brand.status === "ACTIVE" && toggleBrand(brand.name)}
                      className={cn(
                        "p-6 rounded-2xl border-2 transition-all cursor-pointer group flex items-start gap-4",
                        selectedBrands.includes(brand.name) 
                          ? "bg-primary/10 border-primary" 
                          : "bg-surface-container-low border-outline-variant hover:border-primary/40",
                        brand.status !== "ACTIVE" && "opacity-50 grayscale cursor-not-allowed"
                      )}
                    >
                      <div className={cn("w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-1", selectedBrands.includes(brand.name) ? "bg-primary border-primary text-background" : "border-outline-variant")}>
                        {selectedBrands.includes(brand.name) && <Check size={14} strokeWidth={4} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{brand.name}</p>
                        {brand.status !== "ACTIVE" && <p className="text-[10px] text-red-500 font-black uppercase mt-1 tracking-tighter">{brand.status.replace("_", " ")}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-bold font-headline text-secondary border-l-4 border-secondary pl-4 uppercase tracking-widest">
                  Where did you hear about us?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {REFERRAL_SOURCES.map(source => (
                    <div
                      key={source}
                      onClick={() => toggleReferral(source)}
                      className={cn(
                        "p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4",
                        referralSource.includes(source) 
                          ? "bg-secondary/10 border-secondary" 
                          : "bg-surface-container-low border-outline-variant hover:border-secondary/40"
                      )}
                    >
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", referralSource.includes(source) ? "bg-secondary border-secondary text-background" : "border-outline-variant")}>
                        {referralSource.includes(source) && <Check size={12} strokeWidth={4} />}
                      </div>
                      <p className="text-sm font-medium text-on-surface-variant">{source}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Verification */}
          {currentStep === 4 && (
            <div className="animate-vapor space-y-12">
              <div className="flex flex-col md:flex-row gap-6 p-2 rounded-3xl bg-surface-container-low border border-outline-variant">
                <button
                  onClick={() => setVerificationMode("PRIMARY")}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-black font-headline uppercase tracking-widest transition-all",
                    verificationMode === "PRIMARY" ? "bg-primary text-background shadow-lg" : "text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  Primary ID
                </button>
                <button
                  onClick={() => setVerificationMode("SECONDARY")}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-black font-headline uppercase tracking-widest transition-all",
                    verificationMode === "SECONDARY" ? "bg-secondary text-background shadow-lg" : "text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  Two Secondary IDs
                </button>
              </div>

              {verificationMode === "PRIMARY" ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-primary uppercase">ID Type</label>
                      <select
                        className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant outline-none"
                        value={kycMetaData.idType}
                        onChange={(e) => setKycMetaData(d => ({...d, idType: e.target.value}))}
                      >
                        <option value="">Select Primary ID *</option>
                        {PRIMARY_IDS.map(id => <option key={id} value={id}>{id}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-primary uppercase">ID Number</label>
                      <input
                        type="text"
                        placeholder="Enter ID Number *"
                        className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant outline-none"
                        value={kycMetaData.idNumber}
                        onChange={(e) => setKycMetaData(d => ({...d, idNumber: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <IdUploadField 
                      label="ID Front View" 
                      side="FRONT" 
                      required
                      onFileSelect={(file) => setKycFiles(d => ({...d, idPhoto: file}))} 
                    />
                    <IdUploadField 
                      label="ID Back View" 
                      side="BACK" 
                      onFileSelect={(file) => setKycFiles(d => ({...d, idBack: file}))} 
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="p-8 rounded-3xl border-2 border-dashed border-secondary/20 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <select
                        className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant outline-none"
                        value={kycMetaData.secondaryId1Type}
                        onChange={(e) => setKycMetaData(d => ({...d, secondaryId1Type: e.target.value}))}
                      >
                        <option value="">First Secondary ID *</option>
                        {SECONDARY_IDS.map(id => <option key={id} value={id}>{id}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="First ID Number"
                        className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant outline-none"
                        value={kycMetaData.secondaryId1Number}
                        onChange={(e) => setKycMetaData(d => ({...d, secondaryId1Number: e.target.value}))}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <IdUploadField label="ID 1 Front" side="FRONT" required onFileSelect={(file) => setKycFiles(d => ({...d, secondaryId1Front: file}))} />
                      <IdUploadField label="ID 1 Back" side="BACK" onFileSelect={(file) => setKycFiles(d => ({...d, secondaryId1Back: file}))} />
                    </div>
                  </div>

                  <div className="p-8 rounded-3xl border-2 border-dashed border-tertiary/20 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <select
                        className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant outline-none"
                        value={kycMetaData.secondaryId2Type}
                        onChange={(e) => setKycMetaData(d => ({...d, secondaryId2Type: e.target.value}))}
                      >
                        <option value="">Second Secondary ID *</option>
                        {SECONDARY_IDS.map(id => <option key={id} value={id}>{id}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="Second ID Number"
                        className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant outline-none"
                        value={kycMetaData.secondaryId2Number}
                        onChange={(e) => setKycMetaData(d => ({...d, secondaryId2Number: e.target.value}))}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <IdUploadField label="ID 2 Front" side="FRONT" required onFileSelect={(file) => setKycFiles(d => ({...d, secondaryId2Front: file}))} />
                      <IdUploadField label="ID 2 Back" side="BACK" onFileSelect={(file) => setKycFiles(d => ({...d, secondaryId2Back: file}))} />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-outline-variant">
                <IdUploadField 
                  label="Selfie with ID (Keep your face and ID visible) *" 
                  side="SELFIE" 
                  required
                  onFileSelect={(file) => setKycFiles(d => ({...d, selfie: file}))} 
                />
              </div>
            </div>
          )}

          {/* Step 5: Review & Disclaimer */}
          {currentStep === 5 && (
            <div className="animate-vapor space-y-12 pb-12">
              <div>
                <h1 className="text-3xl font-black font-headline text-on-surface mb-2">Final Review & Consent</h1>
                <p className="text-on-surface-variant">Step 5: Review your data and agree to verification terms.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard className="p-8 space-y-6">
                  <h3 className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Identity Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Full Name</p>
                      <p className="font-bold text-on-surface text-lg">{profileData.firstName} {profileData.lastName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Facebook Name</p>
                      <p className="font-medium text-on-surface">{profileData.fbProfileName}</p>
                    </div>
                    <div className="flex gap-12">
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">Mobile</p>
                        <p className="font-medium text-on-surface">{profileData.mobileNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">City</p>
                        <p className="font-medium text-on-surface">{profileData.city}</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-8 space-y-6">
                  <h3 className="text-[10px] font-black uppercase text-secondary tracking-[0.3em]">Programs Selection</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBrands.map(b => (
                      <span key={b} className="px-3 py-1.5 rounded-lg bg-secondary/10 border border-secondary/20 text-[10px] font-black text-secondary tracking-wider">
                        {b}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </div>

              <KycDisclaimer />

              <div 
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={cn(
                  "p-8 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-6 group",
                  agreedToTerms ? "bg-emerald-500/10 border-emerald-500" : "bg-surface-container-low border-outline-variant hover:border-emerald-500/40"
                )}
              >
                <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors", agreedToTerms ? "bg-emerald-500 border-emerald-500 text-background" : "border-outline-variant group-hover:border-emerald-500")}>
                  {agreedToTerms && <Check size={20} strokeWidth={4} />}
                </div>
                <p className="text-sm font-bold text-on-surface leading-snug">
                  “I confirm that all information provided is accurate and I agree to Affiliate Hub PH’s KYC verification and data privacy terms.”
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-16 flex items-center justify-between pt-12 border-t border-outline-variant/30">
            {currentStep > 1 ? (
              <button
                onClick={() => { setError(null); setCurrentStep((prev) => prev - 1); }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-on-surface-variant hover:text-on-surface transition-all"
              >
                <ChevronLeft size={20} /> Back
              </button>
            ) : <div />}
            
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="px-12 py-5 rounded-2xl bg-primary text-background font-black font-headline tracking-widest shadow-[0_0_40px_rgba(129,236,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
              >
                Continue <ChevronRight size={22} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="px-16 py-5 rounded-2xl bg-primary text-background font-black font-headline tracking-widest shadow-[0_0_50px_rgba(129,236,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="animate-spin" /> : <Send size={22} />}
                {isPending ? "PROCESSING..." : "SUBMIT APPLICATION"}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Functional Support Chat */}
      <SupportWidget />
      {/* Initial Ad Pop-up */}
      {showInitialAd && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
           <GlassCard className="max-w-2xl w-full p-8 space-y-8 animate-vapor border-primary/30 shadow-[0_0_50px_rgba(129,236,255,0.2)]">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                       <Rocket size={24} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black font-headline text-on-surface uppercase tracking-tight">Onboarding <span className="text-primary">Intel</span></h2>
                       <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Protocol Briefing Required</p>
                    </div>
                 </div>
                 <button onClick={() => setShowInitialAd(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-on-surface-variant">
                    <X size={24} />
                 </button>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black relative">
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-primary/10 to-transparent">
                    <CheckCircle2 size={48} className="text-primary mb-4 animate-pulse" />
                    <h3 className="text-xl font-black text-on-surface uppercase mb-2">How to Sign Up</h3>
                    <p className="text-sm text-on-surface-variant max-w-sm">
                       Ensure your GCash Name matches your ID exactly. Verification is prioritized for complete profiles with multiple IDs.
                    </p>
                 </div>
                 {/* In a real scenario, this would be a video or a slider */}
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black text-on-surface uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <ShieldCheck size={12} className="text-emerald-500" /> Security Protocol
                 </p>
                 <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                    Welcome to the network. Before you begin the application, ensure you have your Primary ID and a stable connection for the selfie verification step. This process takes 5 minutes.
                 </p>
              </div>

              <button 
                onClick={() => setShowInitialAd(false)}
                className="w-full py-5 bg-primary text-background rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
              >
                PROCEED TO INITIALIZATION
              </button>
           </GlassCard>
        </div>
      )}
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <ApplyPageContent />
    </Suspense>
  );
}



