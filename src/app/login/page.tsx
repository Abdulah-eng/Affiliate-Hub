"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Zap,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? "Invalid credentials. Please try again." : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false
    });

    if (result?.error) {
      setError("Invalid username or password. Please try again.");
      setLoading(false);
      return;
    }

    // Redirect based on role — fetch the updated session to get role
    // For now, always go to agent. Middleware will redirect admins if needed.
    router.push("/agent");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="w-full max-w-md relative z-10 animate-vapor">
        {/* Logo/Brand Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 border border-primary/20 shadow-[0_0_20px_rgba(129,236,255,0.1)]">
            <Shield className="text-primary" size={32} />
          </div>
          <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface">
            Affiliate Hub <span className="text-primary">PH</span>
          </h1>
          <p className="text-on-surface-variant mt-2 font-medium">
            Access your high-performance affiliate hub
          </p>
        </div>

        <GlassCard className="p-10 neon-glow-primary border-primary/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em] ml-1">
                Username or Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface-container-low/50 px-12 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline text-on-surface"
                  placeholder="your_username or email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-bold font-headline text-primary uppercase tracking-[0.2em]">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-[10px] uppercase font-bold text-on-surface-variant hover:text-primary transition-colors tracking-widest"
                >
                  Recovery?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low/50 px-12 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline text-on-surface font-mono"
                  placeholder="••••••••"
                  required
                  disabled={loading}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary text-background rounded-xl font-black font-headline tracking-widest uppercase shadow-[0_0_30px_rgba(129,236,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group px-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  INITIALIZE SESSION{" "}
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-outline-variant/20 text-center">
            <p className="text-sm text-on-surface-variant">
              New operative?{" "}
              <Link
                href="/apply"
                className="text-primary font-bold hover:underline underline-offset-4"
              >
                Submit Application
              </Link>
            </p>
          </div>
        </GlassCard>

        {/* Footer info */}
        <div className="mt-12 flex justify-between items-center px-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
            <Zap size={10} /> Powered by NextAuth
          </div>
          <div className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
            v1.0.0-LIVE
          </div>
        </div>
      </div>
    </div>
  );
}
