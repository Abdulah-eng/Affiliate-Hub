import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  HelpCircle, 
  Book, 
  MessageSquare, 
  Zap, 
  Search,
  ArrowRight,
  LifeBuoy
} from "lucide-react";

export default function HelpPage() {
  const categories = [
    { name: "Getting Started", desc: "Initialize your operative node and clear KYC.", icon: <Zap size={20} className="text-primary" /> },
    { name: "Kinetic Rewards", desc: "Understanding points, tiers, and expansion.", icon: <Book size={20} className="text-secondary" /> },
    { name: "Vault Security", desc: "Credential management and authorization.", icon: <ShieldCheck size={20} className="text-emerald-400" /> },
    { name: "Nexus Feed", desc: "Global frequency transmission protocol.", icon: <MessageSquare size={20} className="text-tertiary" /> },
  ];

  const faqs = [
    { q: "How do I become a verified agent?", a: "You must complete the 'Apply' workflow including the multi-step identification packet (KYC). Once submitted, our CSR operatives will review your node within 24-48h." },
    { q: "What is the point conversion rate?", a: "Current kinetic points (PTS) are calculated based on verified node propagation. 1,000 PTS is equivalent to one 'Standard Spin' in the Raffle Arena." },
    { q: "Can I manage multiple brand credentials?", a: "Yes. Once your vault is active, you can request credentials for any available partner (BIGWIN, Rollem, etc.) directly from your dashboard." }
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto space-y-16">
        {/* Hero */}
        <div className="text-center space-y-6 animate-vapor">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse border border-primary/20">
               <LifeBuoy size={40} />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter uppercase leading-none">
            Help <span className="text-primary">Center</span>
          </h1>
          <div className="relative max-w-2xl mx-auto">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
             <input 
              placeholder="Search the Kinetic Knowledge Graph..." 
              className="w-full bg-surface-container-low/40 border border-white/5 h-16 rounded-full pl-16 pr-8 text-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all shadow-2xl"
             />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-vapor">
          {categories.map((cat, idx) => (
            <GlassCard key={idx} className="p-8 space-y-4 hover:border-primary/20 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <h3 className="text-lg font-black font-headline uppercase tracking-tight">{cat.name}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed font-medium">{cat.desc}</p>
            </GlassCard>
          ))}
        </div>

        {/* FAQs */}
        <div className="animate-vapor">
          <h2 className="text-3xl font-black font-headline tracking-tighter uppercase mb-10 text-center">Frequently <span className="text-primary">Sync'd</span> Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <GlassCard key={idx} className="p-8 space-y-3 hover:bg-white/5 transition-all text-left">
                <h4 className="text-sm font-black text-on-surface uppercase tracking-widest flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-primary" />
                   {faq.q}
                </h4>
                <p className="text-sm text-on-surface-variant leading-relaxed font-medium pl-6">
                  {faq.a}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <GlassCard className="p-12 text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <h2 className="text-3xl font-black font-headline text-on-surface uppercase tracking-tight mb-4">Still in the <span className="text-primary">Dark?</span></h2>
          <p className="text-on-surface-variant max-w-xl mx-auto mb-10 font-medium">
            Authorized agents can initialize a direct transmission with our CSR support nodes for 24/7 priority assistance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button className="px-10 py-4 bg-primary text-background rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] transition-all">Start Transmission</button>
             <button className="px-10 py-4 border border-outline-variant/30 text-on-surface rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all">Telegram Sync</button>
          </div>
        </GlassCard>
      </main>

      <Footer />
    </div>
  );
}

import { ShieldCheck } from "lucide-react";
