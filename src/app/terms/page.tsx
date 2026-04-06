import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { ShieldAlert, Scale, ScrollText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      title: "1. Kinetic Vault Access",
      content: "Affiliate Hub PH provides access to a centralized bank of affiliate marketing assets and partner program credentials. Access is granted solely to verified 'Operatives' (Agents) who have successfully cleared the KYC (Know Your Customer) protocol. Unauthorized access or attempt to subvert the Vault security is strictly prohibited."
    },
    {
      title: "2. Performance Integrity",
      content: "All agents agree to conduct their network propagation with maximum integrity. Any attempt to generate 'Phantom Nodes' (fraudulent referrals) or manipulate conversion data using non-authorized kinetic interference will result in immediate and permanent vault decommissioning without point restitution."
    },
    {
      title: "3. Point Allocation & Rewards",
      content: "Points are awarded based on system-validated engagement and verified node growth. The system utilizes real-time AI monitoring for all transmissions in the Nexus Feed. Rewards, once confirmed, are held in the agent wallet and are subject to final audit before redemption."
    },
    {
      title: "4. Partner Program Compliance",
      content: "While Affiliate Hub PH facilitates access, agents must adhere to the specific terms and conditions set forth by each partner brand (e.g., BIGWIN, Rollem). The Hub act as a gateway and aggregator, and is not responsible for the independent policies of third-party platform providers."
    },
    {
      title: "5. Termination of Status",
      content: "We reserve the right to suspend or terminate any operative's status for failure to comply with the Hub's security protocols, repeated low-quality frequency transmissions, or breach of partner terms. Upon termination, all assigned credentials will be immediately revoked."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto space-y-12">
        <div className="animate-vapor">
          <div className="flex items-center gap-4 text-primary mb-6">
            <Scale size={32} />
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter uppercase">
              Terms of <span className="text-primary">Service</span>
            </h1>
          </div>
          <p className="text-on-surface-variant font-medium leading-relaxed">
            Last Synchronized: April 01, 2026. These terms govern the deployment and operation of all agents within the Affiliate Hub PH ecosystem.
          </p>
        </div>

        <GlassCard className="p-10 space-y-12 animate-vapor bg-surface-container-low/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ScrollText size={150} className="text-primary" />
          </div>
          
          <div className="relative z-10 space-y-10">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-xl font-black text-on-surface font-headline uppercase tracking-tight flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-primary" />
                  {section.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed pl-8 font-medium">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-outline-variant/10 relative z-10">
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-primary/10 border border-primary/20">
              <ShieldAlert className="text-primary mt-1 shrink-0" size={18} />
              <p className="text-[10px] font-black text-primary leading-relaxed uppercase tracking-widest">
                Continued use of the Kinetic Vault following protocol updates signifies acceptance of the revised Terms of Service. Always ensure your node is synchronized with the latest legal frequency.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Footer info copy */}
        <div className="text-center text-xs text-on-surface-variant/40 animate-vapor">
          Questions regarding the Terms of Service should be transmitted to the <span className="text-primary font-bold">Support Node</span>.
        </div>
      </main>

      <Footer />
    </div>
  );
}
