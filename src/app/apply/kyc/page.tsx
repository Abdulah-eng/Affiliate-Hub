"use client";

import React, { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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

const BRANDS = [
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

export default function GoogleKycPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
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
    // Brands & referral
    formData.set("requestedBrands", JSON.stringify(selectedBrands));
    formData.set("referralSource", referralSource.join(", "));
    formData.set("agreedToTerms", agreedToTerms.toString());

    startTransition(async () => {
      const result = await submitKycForGoogleUser(userId, formData);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Submission failed. Please try again.");
      }
    });
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
                ["mobileNumber", "Mobile Number", "09XX XXX XXXX", ""],
                ["address", "Address", "Street, Barangay", ""],
                ["city", "City", "Manila", ""],
              ].map(([k, lbl, ph, extra]) => (
                <div key={k}>
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">{lbl} *</label>
                  <input value={(profile as any)[k]} onChange={e => setProfile(p => ({...p, [k]: e.target.value}))}
                    className={cn("w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-on-surface transition-all", extra)}
                    placeholder={ph} />
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
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-3">Select Partner Brands *</label>
                <div className="grid grid-cols-1 gap-2">
                  {BRANDS.map(brand => (
                    <button type="button" key={brand.id} disabled={brand.status !== "ACTIVE"}
                      onClick={() => setSelectedBrands(prev => prev.includes(brand.id) ? prev.filter(b => b !== brand.id) : [...prev, brand.id])}
                      className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                        selectedBrands.includes(brand.id) ? "bg-primary/10 border-primary/40 text-primary" : "border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface",
                        brand.status !== "ACTIVE" && "opacity-30 cursor-not-allowed")}>
                      <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0", selectedBrands.includes(brand.id) ? "bg-primary border-primary" : "border-outline-variant")}>
                        {selectedBrands.includes(brand.id) && <Check size={12} className="text-background" />}
                      </div>
                      <span className="font-bold text-sm">{brand.name}</span>
                      <span className={cn("ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                        brand.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-surface-container text-on-surface-variant")}>{brand.status}</span>
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
            <div className="space-y-6">
              <h2 className="text-xl font-black text-on-surface uppercase tracking-tight">Identity Verification</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Primary ID Type *</label>
                  <select value={kycMeta.idType} onChange={e => setKycMeta(k => ({...k, idType: e.target.value}))}
                    className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-on-surface transition-all">
                    <option value="">Select Primary ID</option>
                    {PRIMARY_IDS.map(id => <option key={id} value={id}>{id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Primary ID Number *</label>
                  <input value={kycMeta.idNumber} onChange={e => setKycMeta(k => ({...k, idNumber: e.target.value}))}
                    className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-on-surface font-mono transition-all" placeholder="ID Number" />
                </div>
              </div>
              <IdUploadField label="Government ID Front" side="FRONT" onFileSelect={setFile("idPhoto")} />
              <IdUploadField label="Government ID Back" side="BACK" onFileSelect={setFile("idBack")} />
              <IdUploadField label="Selfie with ID" side="SELFIE" onFileSelect={setFile("selfie")} />

              <div className="border-t border-outline-variant/20 pt-6">
                <h3 className="text-sm font-black text-on-surface uppercase tracking-tight mb-4">First Secondary ID</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <select value={kycMeta.secondaryId1Type} onChange={e => setKycMeta(k => ({...k, secondaryId1Type: e.target.value}))}
                      className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-on-surface transition-all">
                      <option value="">First Secondary ID</option>
                      {SECONDARY_IDS.map(id => <option key={id} value={id}>{id}</option>)}
                    </select>
                    <input value={kycMeta.secondaryId1Number} onChange={e => setKycMeta(k => ({...k, secondaryId1Number: e.target.value}))}
                      className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-on-surface font-mono transition-all" placeholder="ID Number" />
                  </div>
                  <IdUploadField label="ID 1 Front" side="FRONT" onFileSelect={setFile("secondaryId1Front")} />
                  <IdUploadField label="ID 1 Back" side="BACK" onFileSelect={setFile("secondaryId1Back")} />
                </div>
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
                  <div><span className="text-on-surface-variant">Brands:</span> <span className="text-on-surface font-bold">{selectedBrands.length}</span></div>
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
              <button type="button" onClick={() => setCurrentStep(s => s + 1)}
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
