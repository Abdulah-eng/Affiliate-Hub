"use client";

import React, { useState, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  User,
  Mail,
  MapPin,
  MessageSquare,
  FileImage,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Loader2,
  Check
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { reviewApplication } from "@/app/actions/admin";

type PlatformAssignment = {
  brandId: string;
  brandName: string;
  username: string;
  password: string;
};

type Props = {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    affiliateUsername: string;
    location: string;
    idPhotoUrl: string | null;
    selfieUrl: string | null;
    kycStatus: string;
    kycNotes: string;
    kycSubmittedAt: string | null;
    kycReviewedAt: string | null;
  };
  platforms: {
    id: string;
    brandId: string;
    brandName: string;
    username: string;
    password: string;
    status: string;
  }[];
  allBrands: { id: string; name: string; loginUrl: string }[];
};

export default function KYCReviewDetail({ user, platforms, allBrands }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(user.kycNotes);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Platform credential assignments
  const [assignments, setAssignments] = useState<PlatformAssignment[]>(
    platforms.length > 0
      ? platforms.map((p) => ({
          brandId: p.brandId,
          brandName: p.brandName,
          username: p.username,
          password: p.password
        }))
      : []
  );

  const [newBrandId, setNewBrandId] = useState(allBrands[0]?.id || "");

  const updateAssignment = (brandId: string, field: "username" | "password", value: string) => {
    setAssignments((prev) =>
      prev.map((a) => (a.brandId === brandId ? { ...a, [field]: value } : a))
    );
  };

  const addPlatform = () => {
    if (!newBrandId) return;
    if (assignments.find((a) => a.brandId === newBrandId)) return;
    const brand = allBrands.find((b) => b.id === newBrandId);
    if (!brand) return;
    setAssignments((prev) => [
      ...prev,
      { brandId: brand.id, brandName: brand.name, username: "", password: "" }
    ]);
  };

  const handleAction = (status: "APPROVED" | "REJECTED" | "REQUEST_REUPLOAD") => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await reviewApplication(
        user.id,
        status,
        notes,
        status === "APPROVED"
          ? assignments.map((a) => ({
              brandId: a.brandId,
              username: a.username,
              password: a.password
            }))
          : undefined
      );
      if (result.success) {
        setSuccess(
          status === "APPROVED"
            ? "✅ Application approved and credentials pushed to agent vault!"
            : status === "REJECTED"
            ? "❌ Application rejected. Agent has been notified."
            : "🔄 Re-upload request sent to agent."
        );
        setTimeout(() => router.push("/admin/reviews"), 2000);
      } else {
        setError(result.error || "Something went wrong.");
      }
    });
  };

  const statusBadge = (s: string) => {
    if (s === "PENDING") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (s === "APPROVED") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (s === "REJECTED") return "bg-red-500/10 text-red-400 border-red-500/20";
    return "bg-primary/10 text-primary border-primary/20";
  };

  return (
    <div className="animate-vapor space-y-8 max-w-5xl">
      {/* Back */}
      <Link
        href="/admin/reviews"
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={16} /> Back to Reviews
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-2xl">
            {(user.name || user.username)[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black font-headline text-on-surface tracking-tight">
              {user.name || user.username}
            </h1>
            <p className="text-on-surface-variant text-sm font-medium">
              @{user.username}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border",
            statusBadge(user.kycStatus)
          )}
        >
          {user.kycStatus}
        </span>
      </div>

      {/* Status Banner */}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-sm">
          <Check size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium text-sm">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Applicant Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details */}
          <GlassCard className="p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">
              Applicant Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: <User size={16} />, label: "Full Name", value: user.name },
                { icon: <Mail size={16} />, label: "Email", value: user.email },
                {
                  icon: <MessageSquare size={16} />,
                  label: "Affiliate Hub Username",
                  value: user.affiliateUsername || "—"
                },
                {
                  icon: <MapPin size={16} />,
                  label: "Location",
                  value: user.location || "—"
                }
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary/60 shrink-0 mt-1">
                    {icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-on-surface mt-1">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* KYC Documents */}
          <GlassCard className="p-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-6">
              Identity Documents
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Government ID
                </p>
                <div className="border-2 border-dashed border-outline-variant rounded-xl h-40 flex items-center justify-center bg-surface-container/30">
                  {user.idPhotoUrl && user.idPhotoUrl !== "/mock-id.png" ? (
                    <img
                      src={user.idPhotoUrl}
                      alt="ID"
                      className="object-cover h-full w-full rounded-xl"
                    />
                  ) : (
                    <div className="text-center">
                      <FileImage size={32} className="mx-auto mb-2 text-on-surface-variant/40" />
                      <p className="text-xs text-on-surface-variant">
                        No photo uploaded
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Selfie with ID
                </p>
                <div className="border-2 border-dashed border-outline-variant rounded-xl h-40 flex items-center justify-center bg-surface-container/30">
                  {user.selfieUrl && user.selfieUrl !== "/mock-selfie.png" ? (
                    <img
                      src={user.selfieUrl}
                      alt="Selfie"
                      className="object-cover h-full w-full rounded-xl"
                    />
                  ) : (
                    <div className="text-center">
                      <FileImage size={32} className="mx-auto mb-2 text-on-surface-variant/40" />
                      <p className="text-xs text-on-surface-variant">
                        No selfie uploaded
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Platform Credentials */}
          <GlassCard className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary">
                Platform Credentials
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={newBrandId}
                  onChange={(e) => setNewBrandId(e.target.value)}
                  className="text-xs bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface outline-none focus:border-primary"
                >
                  {allBrands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addPlatform}
                  className="p-2 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-background transition-all border border-primary/20"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {assignments.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-8">
                No platforms assigned. Select a platform above and click + to add.
              </p>
            ) : (
              <div className="space-y-4">
                {assignments.map((a) => (
                  <div
                    key={a.brandId}
                    className="border border-outline-variant/30 rounded-xl p-4 space-y-3 bg-surface-container/20"
                  >
                    <p className="text-xs font-black text-primary uppercase tracking-widest">
                      {a.brandName}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value={a.username}
                          onChange={(e) =>
                            updateAssignment(a.brandId, "username", e.target.value)
                          }
                          className="w-full bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm text-on-surface"
                          placeholder="agent_username"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">
                          Password
                        </label>
                        <input
                          type="text"
                          value={a.password}
                          onChange={(e) =>
                            updateAssignment(a.brandId, "password", e.target.value)
                          }
                          className="w-full bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm text-on-surface font-mono"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right: Decision Panel */}
        <div className="space-y-6">
          <GlassCard className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck size={18} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-on-surface">
                CSR Decision
              </h3>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Notes / Remarks
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm text-on-surface resize-none"
                placeholder="Add review notes visible to agent..."
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleAction("APPROVED")}
                disabled={isPending}
                className="w-full py-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-background border border-emerald-500/30 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Approve KYC
              </button>

              <button
                onClick={() => handleAction("REQUEST_REUPLOAD")}
                disabled={isPending}
                className="w-full py-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RotateCcw size={16} />
                Request Re-upload
              </button>

              <button
                onClick={() => handleAction("REJECTED")}
                disabled={isPending}
                className="w-full py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle size={16} />
                Reject Application
              </button>
            </div>
          </GlassCard>

          {/* Timeline */}
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Timeline
            </h3>
            <div className="space-y-3 text-xs">
              {user.kycSubmittedAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="font-bold text-on-surface">Application Submitted</p>
                    <p className="text-on-surface-variant">
                      {new Date(user.kycSubmittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {user.kycReviewedAt && (
                <div className="flex gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      user.kycStatus === "APPROVED" ? "bg-emerald-400" : "bg-red-400"
                    )}
                  />
                  <div>
                    <p className="font-bold text-on-surface">
                      {user.kycStatus === "APPROVED" ? "Approved" : "Reviewed"}
                    </p>
                    <p className="text-on-surface-variant">
                      {new Date(user.kycReviewedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
