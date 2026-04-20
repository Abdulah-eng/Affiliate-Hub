"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { IdUploadField } from "@/components/kyc/IdUploadField";
import { KycDisclaimer } from "@/components/kyc/KycDisclaimer";
import {
  Check, ChevronRight, ChevronLeft, Loader2,
  AlertCircle, CheckCircle2, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitKycForGoogleUser } from "@/app/actions/auth";

const STEPS = [
  { id: 1, name: "Profile" },
  { id: 2, name: "Affiliate" },
  { id: 3, name: "Verification" },
  { id: 4, name: "Review" },
];

const PLATFORMS = [
  { id: "POTS", name: "Pearl Of The Seas (POTS)", status: "ACTIVE" },
  { id: "WinForLife", name: "Win For Life", status: "ACTIVE" },
  { id: "Rollem", name: "Rollem", status: "ACTIVE" },
  { id: "TAMASA", name: "TAMASA", status: "ACTIVE" },
  { id: "COW", name: "COW", status: "ACTIVE" },
  { id: "MegaPerya", name: "Mega Perya", status: "COMING_SOON" },
  { id: "BIGWIN", name: "BIGWIN", status: "UNAVAILABLE" },
];

const PRIMARY_IDS = [
  "PhilSys National ID", "Passport", "Driver's License",
  "UMID (SSS / GSIS)", "PRC ID", "Postal ID (new version)",
  "Voter's ID (older but still accepted)"
];

const SECONDARY_IDS = [
  "PhilHealth ID", "TIN ID", "Barangay Clearance",
  "Police Clearance", "Birth Certificate (PSA)"
];

const REFERRAL_SOURCES = [
  "Facebook Page", "Facebook Group", "Facebook Ads / Sponsored Post",
  "Messenger Community Chat", "Referral from a Friend / Family / Other Agent"
];

function GoogleKycPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [referralSource, setReferralSource] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Profile fields
  const [profile, setProfile] = useState({
    firstName: "", lastName: "", username: "",
    fbProfileName: "", mobileNumber: "", address: "", city: "",
    affiliateUsername: ""
  });

  // KYC fields
  const [kycMeta, setKycMeta] = useState({
    verificationMode: "PRIMARY",
    idType: "", idNumber: "",
    secondaryId1Type: "", secondaryId1Number: "",
    secondaryId2Type: "", secondaryId2Number: "",
  });

  // File state
  const [kycFiles, setKycFiles] = useState<Record<string, File | null>>({
    idPhoto: null, idBack: null,
    secondaryId1Front: null, secondaryId1Back: null,
    secondaryId2Front: null, secondaryId2Back: null,
    selfie: null
  });

  const setFile = (key: string) => (file: File | null) =>
    setKycFiles(prev => ({ ...prev, [key]: file }));

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.replace("/apply");
    return null;
  }

  const userId = (session?.user as any)?.id;
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image || "";
  const userName = session?.user?.name || "";
  const kycStatus = (session?.user as any)?.kycStatus;

  useEffect(() => {
    if (status === "authenticated") {
      if (kycStatus === "APPROVED") {
        router.push("/agent");
      } else if (kycStatus === "PENDING" && !success) {
        // Option: allow them to see the success screen again if they refresh
        setSuccess(true);
      }
    }
  }, [status, kycStatus, router, success]);

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md animate-vapor">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-emerald-400" size={40} />
          </div>
          <h1 className="text-3xl font-black font-headline text-on-surface">Application Submitted!</h1>
          <p className="text-on-surface-variant">Your KYC application is under review. You can track the status on your dashboard.</p>
          <button onClick={() => router.push("/agent")}
            className="w-full py-4 bg-primary text-background rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!userId) return;
    setError(null);
    const formData = new FormData();

    // Profile
    Object.entries(profile).forEach(([k, v]) => formData.set(k, v));
    // KYC meta
    Object.entries(kycMeta).forEach(([k, v]) => formData.set(k, v));
    // Files
    Object.entries(kycFiles).forEach(([k, v]) => { if (v) formData.set(k, v); });
    // Platforms & referral
    formData.set("requestedPlatforms", JSON.stringify(selectedPlatforms));
    formData.set("referralSource", referralSource.join(", "));
    formData.set("agreedToTerms", agreedToTerms.toString());
    if (referralCode) formData.set("referrerCode", referralCode);

    startTransition(async () => {
      const result = await submitKycForGoogleUser(userId, formData);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Submission failed. Please try again.");
      }
    });
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      if (!profile.firstName || !profile.lastName || !profile.mobileNumber || !profile.city || !profile.username) {
        setError("Please fill in all required profile fields.");
        return;
      }
    }
    if (currentStep === 2) {
      if (selectedPlatforms.length === 0) {
        setError("Please select at least one partner platform.");
        return;
      }
    }
    if (currentStep === 3) {
      if (kycMeta.verificationMode === "PRIMARY") {
        if (!kycMeta.idType || !kycMeta.idNumber || !kycFiles.idPhoto) {
          setError("Primary ID Type, Number, and Front Photo are required.");
          return;
        }
      } else {
        if (!kycMeta.secondaryId1Type || !kycMeta.secondaryId1Number || !kycFiles.secondaryId1Front) {
          setError("First Secondary ID Type, Number, and Front Photo are required.");
          return;
        }
        if (!kycMeta.secondaryId2Type || !kycMeta.secondaryId2Number || !kycFiles.secondaryId2Front) {
          setError("Second Secondary ID Type, Number, and Front Photo are required.");
          return;
        }
      }
      if (!kycFiles.selfie) {
        setError("A selfie with your ID is required.");
        return;
      }
    }
    setCurrentStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          {userImage && <img src={userImage} alt={userName} className="w-14 h-14 rounded-full mx-auto mb-4 border-2 border-primary/30" />}
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Signed in as {userEmail}</p>
          <h1 className="text-3xl font-black font-headline text-on-surface">Complete Your KYC Application</h1>
          <p className="text-on-surface-variant mt-2">Fill in your profile and identity verification to join the affiliate network.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                currentStep === step.id ? "bg-primary text-background" :
                currentStep > step.id ? "bg-emerald-500/20 text-emerald-400" :
                "bg-surface-container text-on-surface-variant"
              )}>
                {currentStep > step.id ? <Check size={12} /> : <span>{step.id}</span>}
                {step.name}
              </div>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-outline-variant" />}
            </React.Fragment>
          ))}
        </div>

        <GlassCard className="p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          {/* ─── STEP 1: Profile ─── */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-on-surface uppercase tracking-tight">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {[["firstName", "First Name", "Juan"], ["lastName", "Last Name", "Dela Cruz"]].map(([k, lbl, ph]) => (
                  <div key={k}>
                    <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">{lbl} *</label>
                    <input value={(profile as any)[k]} onChange={e => setProfile(p => ({...p, [k]: e.target.value}))}
                      className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-on-surface transition-all" placeholder={ph} />
                  </div>
                ))}
              </div>
              {[
                ["username", "Username", "juan_trading", "font-mono"],
                ["fbProfileName", "Facebook Profile Name", "Juan Dela Cruz", ""],
                ["mobileNumber", "GCash Number", "09XX XXX XXXX", ""],
                ["address", "Address", "Street, Barangay", ""],
                ["city", "City", "Manila", ""],
              ].map(([k, lbl, ph, extra]) => (
                <div key={k}>
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">{lbl} *</label>
                  <input value={(profile as any)[k]} onChange={e => setProfile(p => ({...p, [k]: e.target.value}))}
                    className={cn("w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-on-surface transition-all", extra)}
                    placeholder={ph} />
                  {k === "mobileNumber" && (
                    <p className="text-[10px] sm:text-xs text-secondary mt-2 font-bold mb-1">
                      Note: This number MUST be your registered GCash number. This will be automatically synced as your withdrawal account.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ─── STEP 2: Affiliate ─── */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-on-surface uppercase tracking-tight">Affiliate Details</h2>
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Affiliate Username</label>
                <input value={profile.affiliateUsername} onChange={e => setProfile(p => ({...p, affiliateUsername: e.target.value}))}
                  className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-on-surface font-mono transition-all"
                  placeholder="Your existing affiliate username (if any)" />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-3">Select Partner Platforms *</label>
                <div className="grid grid-cols-1 gap-2">
                  {PLATFORMS.map(platform => (
                    <button type="button" key={platform.id} disabled={platform.status !== "ACTIVE"}
                      onClick={() => setSelectedPlatforms(prev => prev.includes(platform.id) ? prev.filter(b => b !== platform.id) : [...prev, platform.id])}
                      className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                        selectedPlatforms.includes(platform.id) ? "bg-primary/10 border-primary/40 text-primary" : "border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface",
                        platform.status !== "ACTIVE" && "opacity-30 cursor-not-allowed")}>
                      <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0", selectedPlatforms.includes(platform.id) ? "bg-primary border-primary" : "border-outline-variant")}>
                        {selectedPlatforms.includes(platform.id) && <Check size={12} className="text-background" />}
                      </div>
                      <span className="font-bold text-sm">{platform.name}</span>
                      <span className={cn("ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                        platform.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-surface-container text-on-surface-variant")}>{platform.status}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-3">How did you hear about us?</label>
                <div className="space-y-2">
                  {REFERRAL_SOURCES.map(source => (
                    <button type="button" key={source}
                      onClick={() => setReferralSource(prev => prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source])}
                      className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all text-sm",
                        referralSource.includes(source) ? "bg-secondary/10 border-secondary/40 text-secondary" : "border-outline-variant/30 text-on-surface-variant hover:border-outline-variant")}>
                      <div className={cn("w-4 h-4 rounded border-2 flex-shrink-0", referralSource.includes(source) ? "bg-secondary border-secondary" : "border-outline-variant")} />
                      {source}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* ─── STEP 3: Verification ─── */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-vapor">
              <h2 className="text-xl font-black text-on-surface uppercase tracking-tight mb-2">Identity Verification</h2>
              
              <div className="flex flex-col md:flex-row gap-4 p-2 rounded-2xl bg-surface-container/50 border border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setKycMeta(k => ({...k, verificationMode: "PRIMARY"}))}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-black font-headline uppercase tracking-widest text-sm transition-all",
                    kycMeta.verificationMode === "PRIMARY" ? "bg-primary text-background shadow-[0_4px_20px_rgba(129,236,255,0.4)]" : "text-on-surface-variant hover:bg-white/5"
                  )}
                >
                  Primary ID
                </button>
                <button
                  type="button"
                  onClick={() => setKycMeta(k => ({...k, verificationMode: "SECONDARY"}))}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-black font-headline uppercase tracking-widest text-sm transition-all",
                    kycMeta.verificationMode === "SECONDARY" ? "bg-secondary text-background shadow-[0_4px_20px_rgba(110,155,255,0.4)]" : "text-on-surface-variant hover:bg-white/5"
                  )}
                >
                  Two Secondary IDs
                </button>
              </div>

              {kycMeta.verificationMode === "PRIMARY" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Primary ID Type *</label>
                      <select value={kycMeta.idType} onChange={e => setKycMeta(k => ({...k, idType: e.target.value}))}
                        className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-on-surface transition-all text-sm">
                        <option value="">Select Primary ID</option>
                        {PRIMARY_IDS.map(id => <option key={id} value={id}>{id}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Primary ID Number *</label>
                      <input value={kycMeta.idNumber} onChange={e => setKycMeta(k => ({...k, idNumber: e.target.value}))}
                        className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-on-surface font-mono transition-all text-sm" placeholder="e.g. 1234-5678" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <IdUploadField label="ID Front View" side="FRONT" onFileSelect={setFile("idPhoto")} />
                    <IdUploadField label="ID Back View" side="BACK" onFileSelect={setFile("idBack")} />
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="p-6 rounded-2xl border-2 border-dashed border-secondary/30 space-y-5 bg-secondary/5">
                    <h3 className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-secondary/20 flex items-center justify-center shrink-0">1</div> First Secondary ID</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select value={kycMeta.secondaryId1Type} onChange={e => setKycMeta(k => ({...k, secondaryId1Type: e.target.value}))}
                        className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-secondary/30 focus:border-secondary outline-none text-on-surface transition-all text-sm">
                        <option value="">Select First ID *</option>
                        {SECONDARY_IDS.map(id => <option key={id} value={id}>{id}</option>)}
                      </select>
                      <input value={kycMeta.secondaryId1Number} onChange={e => setKycMeta(k => ({...k, secondaryId1Number: e.target.value}))}
                        className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-secondary/30 focus:border-secondary outline-none text-on-surface font-mono transition-all text-sm" placeholder="ID Number" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <IdUploadField label="ID 1 Front" side="FRONT" onFileSelect={setFile("secondaryId1Front")} />
                      <IdUploadField label="ID 1 Back" side="BACK" onFileSelect={setFile("secondaryId1Back")} />
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border-2 border-dashed border-tertiary/30 space-y-5 bg-tertiary/5">
                    <h3 className="text-xs font-black text-tertiary uppercase tracking-widest flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-tertiary/20 flex items-center justify-center shrink-0">2</div> Second Secondary ID</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select value={kycMeta.secondaryId2Type} onChange={e => setKycMeta(k => ({...k, secondaryId2Type: e.target.value}))}
                        className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-tertiary/30 focus:border-tertiary outline-none text-on-surface transition-all text-sm">
                        <option value="">Select Second ID *</option>
                        {SECONDARY_IDS.map(id => <option key={id} value={id}>{id}</option>)}
                      </select>
                      <input value={kycMeta.secondaryId2Number} onChange={e => setKycMeta(k => ({...k, secondaryId2Number: e.target.value}))}
                        className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-tertiary/30 focus:border-tertiary outline-none text-on-surface font-mono transition-all text-sm" placeholder="ID Number" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <IdUploadField label="ID 2 Front" side="FRONT" onFileSelect={setFile("secondaryId2Front")} />
                      <IdUploadField label="ID 2 Back" side="BACK" onFileSelect={setFile("secondaryId2Back")} />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-outline-variant/30">
                <IdUploadField label="Selfie with ID" side="SELFIE" onFileSelect={setFile("selfie")} />
                <p className="text-[10px] text-on-surface-variant font-medium mt-2 max-w-sm">Please hold your selected ID(s) next to your face. Ensure both your face and the ID details are clear and readable.</p>
              </div>
            </div>
          )}

          {/* ─── STEP 4: Review ─── */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-on-surface uppercase tracking-tight">Review & Submit</h2>
              <GlassCard className="p-6 bg-surface-container/30 space-y-3">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Your Google Account</p>
                <div className="flex items-center gap-3">
                  {userImage && <img src={userImage} alt="" className="w-10 h-10 rounded-full border border-primary/20" />}
                  <div>
                    <p className="font-bold text-on-surface">{userName}</p>
                    <p className="text-xs text-on-surface-variant">{userEmail}</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-6 bg-surface-container/30 space-y-2">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Profile Summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-on-surface-variant">Username:</span> <span className="text-on-surface font-mono font-bold">{profile.username || "—"}</span></div>
                  <div><span className="text-on-surface-variant">Mobile:</span> <span className="text-on-surface font-bold">{profile.mobileNumber || "—"}</span></div>
                  <div><span className="text-on-surface-variant">City:</span> <span className="text-on-surface font-bold">{profile.city || "—"}</span></div>
                  <div><span className="text-on-surface-variant">Platforms:</span> <span className="text-on-surface font-bold">{selectedPlatforms.length}</span></div>
                </div>
              </GlassCard>
              <KycDisclaimer />
              <div className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant/30 cursor-pointer hover:bg-white/5 transition-all" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all", agreedToTerms ? "bg-primary border-primary" : "border-outline-variant")}>
                  {agreedToTerms && <Check size={14} className="text-background" />}
                </div>
                <p className="text-sm text-on-surface-variant">I have read and agree to the KYC terms and conditions above.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-outline-variant/20">
            <button type="button" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold hover:bg-white/5 transition-all disabled:opacity-30">
              <ChevronLeft size={16} /> Back
            </button>

            {currentStep < STEPS.length ? (
              <button type="button" onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-background rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={isPending || !agreedToTerms}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-background rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                {isPending ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><ShieldCheck size={16} /> Submit KYC</>}
              </button>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default function GoogleKycPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <GoogleKycPageContent />
    </React.Suspense>
  );
}

