"use client";

import React, { useState, Suspense } from "react";
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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? "Invalid credentials. Please try again." : null
  );

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/agent" });
  };

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

          {/* Google Sign-In */}
          <div className="mt-6">
            <div className="relative flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-outline-variant/20" />
              <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-outline-variant/20" />
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-4 flex items-center justify-center gap-3 bg-white/5 border border-outline-variant/30 rounded-xl font-bold text-on-surface hover:bg-white/10 hover:border-outline-variant/60 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 size={20} className="animate-spin text-primary" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>
          </div>

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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-primary font-headline tracking-widest uppercase">Initializing Secure Terminal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
