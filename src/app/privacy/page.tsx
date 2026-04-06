import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { ShieldCheck, Eye, Lock, Fingerprint, Database } from "lucide-react";

export default function PrivacyPage() {
  const points = [
    {
      title: "Data Decryption Protocols",
      icon: <Lock size={20} className="text-primary" />,
      content: "Your biometric and identification data (KYC) is encrypted at rest using AES-512-GCM. We only decrypt this data during the active review phase by an authorized CSR (Customer Support Representative)."
    },
    {
      title: "Node Tracking",
      icon: <Fingerprint size={20} className="text-secondary" />,
      content: "We track node propagation (referrals) using unique encrypted identifiers. We do not store plain-text personal information in our public ledger, only your assigned frequency handle."
    },
    {
      title: "External Memory Synchronization",
      icon: <Database size={20} className="text-tertiary" />,
      content: "We do not sell your personal frequency data to third-party data harvesters. Synchronization with partner programs (e.g., BIGWIN) only occurs when you explicitly request a credential vaulting."
    },
    {
      title: "Invisible Surveillance",
      icon: <Eye size={20} className="text-on-surface-variant" />,
      content: "The Nexus Feed is monitored by AI to ensure system integrity and prevent phantom node expansion. This data is used solely for reward validation and platform security."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto space-y-12">
        <div className="animate-vapor">
          <div className="flex items-center gap-4 text-secondary mb-6">
            <ShieldCheck size={32} />
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter uppercase">
              Privacy <span className="text-secondary">Protocol</span>
            </h1>
          </div>
          <p className="text-on-surface-variant font-medium leading-relaxed">
            Version 2.0.4. Specialized encryption and data protection policies for the Affiliate Hub PH Kinetic Vault.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-vapor">
          {points.map((point, idx) => (
            <GlassCard key={idx} className="p-8 space-y-4 hover:border-secondary/20 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {point.icon}
                </div>
                <h3 className="text-lg font-black text-on-surface font-headline uppercase tracking-tight">{point.title}</h3>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                {point.content}
              </p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-10 animate-vapor bg-surface-container-low/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center animate-pulse shrink-0">
               <Fingerprint size={40} className="text-primary" />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h4 className="text-xl font-headline font-black text-on-surface uppercase tracking-tight">Your Right to be <span className="text-primary">Forgotten</span></h4>
              <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                Operatives may decommission their vault at any time via the Settings panel. This will trigger a permanent erasure of all personal identity packets from our primary and secondary databases.
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="text-center text-xs text-on-surface-variant/40 animate-vapor">
          Transmitted from the <span className="text-secondary font-bold">Privacy Control Node</span>.
        </div>
      </main>

      <Footer />
    </div>
  );
}
