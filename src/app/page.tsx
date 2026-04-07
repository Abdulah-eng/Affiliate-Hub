import React from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Globe, 
  ChevronRight,
  Play
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getSystemSettings } from "@/app/actions/admin";

export default async function LandingPage() {
  const settingsData = await getSystemSettings();
  const settings = settingsData.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);

  // --- Dynamic Content Mapping ---
  // Hero
  const heroVideo = settings['CMS_HERO_VIDEO'] || null;
  const heroImage = settings['CMS_HERO_IMAGE'] || "https://lh3.googleusercontent.com/aida-public/AB6AXuDbHj2kCJe6kU6nsw3bn6ZBkpOCfZXMfgm9Q9jV7-Il2ezKb_LcAH8frMHm1EYod6yQXhe0q8FthJkMnl0mC2qN3Y4hR80-0b2nRWgYcigTCIYbuY02PaH0NlQPNHZFquQoeJuM1kGaofdeS-KP2kWhWGn0IyDqACrIxkXFYeliBhcj93DbYtEjO_qCmmeHLZPaMOeyp_QxmT4C4jZiOo98Fp2sTSKC1pLFCBhBv3c5bffgXUkiaov_m8jJilXolIfBcZkPQUmktzY";
  const heroTitle = settings['CMS_HERO_TITLE'] || "Build your affiliate network in one system";
  const heroDesc = settings['CMS_HERO_DESC'] || "The definitive hub for Philippine affiliates. High-performance tools for high-stakes digital assets.";
  const heroBadge = settings['CMS_HERO_BADGE'] || "System Online";
  const heroBtnPrimary = settings['CMS_CTA_BTN_PRIMARY'] || "Apply Now";
  const heroBtnSecondary = settings['CMS_CTA_BTN_SECONDARY'] || "Agent Login";

  // Hero Card
  const cardVal = settings['CMS_HERO_CARD_VAL'] || "98.2%";
  const cardLbl = settings['CMS_HERO_CARD_LBL'] || "Network Health";

  // Stats
  const statVal1 = settings['CMS_STATS_VAL1'] || "100+";
  const statLbl1 = settings['CMS_STATS_LBL1'] || "Partners";
  const statVal2 = settings['CMS_STATS_VAL2'] || "5,000+";
  const statLbl2 = settings['CMS_STATS_LBL2'] || "Applicants";
  const statVal3 = settings['CMS_STATS_VAL3'] || "95%";
  const statLbl3 = settings['CMS_STATS_LBL3'] || "Approval Rate";

  // Features
  const featTitle = settings['CMS_FEAT_TITLE'] || "Engineered for Precision";
  const featSubtitle = settings['CMS_FEAT_SUBTITLE'] || "One central point of control for your entire affiliate ecosystem.";
  const feat1Title = settings['CMS_FEAT1_TITLE'] || "Centralized Dashboard";
  const feat1Desc = settings['CMS_FEAT1_DESC'] || "Real-time tracking of every conversion and commission across all partnered brands from a single pane of glass.";
  const bentoImage1 = settings['CMS_BENTO_IMAGE_1'] || "https://lh3.googleusercontent.com/aida-public/AB6AXuBbHj2kCJe6kU6nsw3bn6ZBkpOCfZXMfgm9Q9jV7-Il2ezKb_LcAH8frMHm1EYod6yQXhe0q8FthJkMnl0mC2qN3Y4hR80-0b2nRWgYcigTCIYbuY02PaH0NlQPNHZFquQoeJuM1kGaofdeS-KP2kWhWGn0IyDqACrIxkXFYeliBhcj93DbYtEjO_qCmmeHLZPaMOeyp_QxmT4C4jZiOo98Fp2sTSKC1pLFCBhBv3c5bffgXUkiaov_m8jJilXolIfBcZkPQUmktzY";

  // HIW
  const hiwTitle = settings['CMS_HIW_TITLE'] || "Your Path to Vault Access";
  const hiwStep1T = settings['CMS_HIW_STEP1_TITLE'] || "Register";
  const hiwStep1D = settings['CMS_HIW_STEP1_DESC'] || "Create your master account and secure your personal Kinetic Vault ID.";
  const hiwStep2T = settings['CMS_HIW_STEP2_TITLE'] || "Choose Partners";
  const hiwStep2D = settings['CMS_HIW_STEP2_DESC'] || "Browse our elite network of high-converting gaming and fintech brands.";
  const hiwStep3T = settings['CMS_HIW_STEP3_TITLE'] || "Submit KYC";
  const hiwStep3D = settings['CMS_HIW_STEP3_DESC'] || "Verify your identity once. Secure, fast, and globally compliant standards.";

  // Partners
  const partnersLabel = settings['CMS_PARTNERS_LABEL'] || "Authorized Partner Network";
  const partnersList = (settings['CMS_PARTNERS_LIST'] || "WinForLife, BIGWIN, Rollem, AceBet, GoldenSlot").split(',').map(s => s.trim());

  // CTA
  const ctaTitle = settings['CMS_CTA_TITLE'] || "Ready to dominate the Affiliate Ecosystem?";
  const ctaDesc = settings['CMS_CTA_DESC'] || "Join the 5,000+ professionals already leveraging the Hub to scale their affiliate networks in the Philippines.";

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
          {/* Background Video (Dynamic) */}
          {heroVideo && (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div className="absolute inset-0 bg-background/60 z-10" />
              <video 
                src={heroVideo} 
                autoPlay 
                muted 
                loop 
                playsInline
                className="w-full h-full object-cover opacity-30"
              />
            </div>
          )}
          {/* Decorative Void Glows */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full"></div>
          
          <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8 animate-vapor">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-primary text-xs font-bold tracking-widest uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {heroBadge}
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold font-headline leading-[1.1] tracking-tighter text-on-surface">
                {heroTitle.includes('affiliate network') ? (
                  <>
                    {heroTitle.split('affiliate network')[0]}
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">affiliate network</span>
                    {heroTitle.split('affiliate network')[1]}
                  </>
                ) : heroTitle}
              </h1>
              
              <p className="text-on-surface-variant text-lg md:text-xl max-w-lg leading-relaxed">
                {heroDesc}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/apply" className="px-8 py-4 bg-primary text-background rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(129,236,255,0.4)]">
                  {heroBtnPrimary}
                </Link>
                <Link href="/login" className="px-8 py-4 border border-primary/20 hover:border-primary/50 text-primary rounded-full font-bold text-lg hover:bg-primary/5 transition-all">
                  {heroBtnSecondary}
                </Link>
              </div>
            </div>

            {/* Glassmorphic Hero Card */}
            <div className="relative group animate-vapor" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary opacity-20 blur-3xl group-hover:opacity-30 transition-opacity"></div>
              <GlassCard className="neon-glow-primary overflow-hidden">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <p className="text-on-surface-variant text-sm uppercase tracking-widest font-headline font-bold">{cardLbl}</p>
                    <h3 className="text-3xl font-bold font-headline mt-1">{cardVal}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <TrendingUp size={24} />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="h-32 w-full flex items-end gap-2 px-2">
                    <div className="w-full bg-primary/20 h-[40%] rounded-t-sm"></div>
                    <div className="w-full bg-primary/20 h-[60%] rounded-t-sm"></div>
                    <div className="w-full bg-primary/20 h-[55%] rounded-t-sm"></div>
                    <div className="w-full bg-primary/20 h-[80%] rounded-t-sm"></div>
                    <div className="w-full bg-primary h-[95%] rounded-t-sm shadow-[0_0_15px_rgba(129,236,255,0.4)]"></div>
                    <div className="w-full bg-primary/20 h-[70%] rounded-t-sm"></div>
                    <div className="w-full bg-primary/20 h-[85%] rounded-t-sm"></div>
                  </div>
                  
                  <div className="pt-6 border-t border-outline-variant/20 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Active Nodes</p>
                      <p className="font-bold text-primary font-headline">5,402</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Settlement Status</p>
                      <p className="font-bold text-secondary font-headline">Verified</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 px-4 bg-surface-container-low/50 border-y border-outline-variant/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 text-center space-y-2">
              <h4 className="text-4xl md:text-5xl font-extrabold font-headline text-primary">{statVal1}</h4>
              <p className="text-on-surface-variant font-medium tracking-wide uppercase text-sm">{statLbl1}</p>
            </div>
            <div className="p-8 text-center space-y-2 border-x border-outline-variant/10">
              <h4 className="text-4xl md:text-5xl font-extrabold font-headline text-primary">{statVal2}</h4>
              <p className="text-on-surface-variant font-medium tracking-wide uppercase text-sm">{statLbl2}</p>
            </div>
            <div className="p-8 text-center space-y-2">
              <h4 className="text-4xl md:text-5xl font-extrabold font-headline text-primary">{statVal3}</h4>
              <p className="text-on-surface-variant font-medium tracking-wide uppercase text-sm">{statLbl3}</p>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-32 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-bold font-headline">
              {featTitle.includes('Precision') ? (
                <>Engineered for <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Precision</span></>
              ) : featTitle}
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">{featSubtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 auto-rows-[350px]">
            <GlassCard className="md:col-span-2 flex flex-col justify-between group hover:border-primary/30 cursor-default">
              <div className="max-w-md">
                <h3 className="text-2xl font-bold font-headline mb-4">{feat1Title}</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  {feat1Desc}
                </p>
              </div>
              <div className="flex items-center gap-4 text-primary font-bold group/link hover:gap-6 transition-all duration-300">
                Learn More <ArrowRight size={20} />
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col justify-center space-y-6 hover:bg-surface-container-high cursor-default">
              <div className="w-14 h-14 bg-secondary/10 flex items-center justify-center rounded-2xl text-secondary">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold font-headline">{settings['CMS_FEAT2_TITLE'] || "One KYC Verification"}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {settings['CMS_FEAT2_DESC'] || "Submit your documents once and gain instant eligibility for all system partners. Hassle-free onboarding."}
              </p>
            </GlassCard>

            <GlassCard className="flex flex-col justify-center space-y-6 hover:bg-surface-container-high cursor-default">
              <div className="w-14 h-14 bg-tertiary/10 flex items-center justify-center rounded-2xl text-tertiary">
                <Layers size={32} />
              </div>
              <h3 className="text-xl font-bold font-headline">{settings['CMS_FEAT3_TITLE'] || "Multi-platform Apply"}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {settings['CMS_FEAT3_DESC'] || "Scale your reach. Apply to multiple brand programs with a single click action. Maximize your portfolio."}
              </p>
            </GlassCard>

            <div className="md:col-span-2 relative overflow-hidden rounded-xl border border-outline-variant/10 group">
              <img 
                alt="Dashboard UI concept" 
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[2s]" 
                src={bentoImage1}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent p-10 flex flex-col justify-end">
                <h3 className="text-2xl font-bold font-headline mb-2">{settings['CMS_FEAT4_TITLE'] || "Automated Insights"}</h3>
                <p className="text-on-surface-variant max-w-sm">
                  {settings['CMS_FEAT4_DESC'] || "AI-driven forecasting to identify which networks are performing best in the current market trends."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Brands */}
        <section className="py-24 border-y border-outline-variant/10 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-on-surface-variant mb-12">{partnersLabel}</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 items-center opacity-60 hover:opacity-100 transition-opacity duration-500">
              {partnersList.map((brand) => (
                <span key={brand} className="text-2xl font-black font-headline tracking-tighter text-on-surface hover:text-primary cursor-default transition-colors">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-32 px-4 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <h2 className="text-4xl font-bold font-headline mb-4">
                {hiwTitle.includes('Vault Access') ? (
                  <>Your Path to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Vault Access</span></>
                ) : hiwTitle}
              </h2>
              <p className="text-on-surface-variant">{settings['CMS_HIW_SUBTITLE'] || "Streamlined onboarding for serious professionals."}</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '01', title: hiwStep1T, desc: hiwStep1D },
                { step: '02', title: hiwStep2T, desc: hiwStep2D },
                { step: '03', title: hiwStep3T, desc: hiwStep3D },
                { step: '04', title: settings['CMS_HIW_STEP4_TITLE'] || 'Dashboard Access', desc: settings['CMS_HIW_STEP4_DESC'] || 'Unlock the full suite of tracking tools and start building your network.' }
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="text-6xl font-black font-headline text-outline-variant/20 absolute -top-10 -left-4 group-hover:text-primary/10 transition-colors">
                    {item.step}
                  </div>
                  <div className="pt-8 space-y-4 relative z-10">
                    <h3 className="text-xl font-bold font-headline">{item.title}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-6 h-1 w-full bg-outline-variant/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/4 group-hover:w-full transition-all duration-500"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4">
          <div className="max-w-5xl mx-auto glass-card rounded-xl p-12 md:p-20 text-center relative overflow-hidden neon-glow-primary">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
            <div className="relative z-10 space-y-8 animate-vapor">
              <h2 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight">
                {ctaTitle.includes('Affiliate Ecosystem?') ? (
                  <>Ready to dominate the <br/><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Affiliate Ecosystem?</span></>
                ) : ctaTitle}
              </h2>
              <p className="text-on-surface-variant text-lg max-w-xl mx-auto">{ctaDesc}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/apply" className="w-full sm:w-auto px-12 py-5 bg-primary text-background rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(129,236,255,0.4)]">
                  {heroBtnPrimary}
                </Link>
                <Link href="/support" className="w-full sm:w-auto px-12 py-5 border border-outline-variant text-on-surface rounded-full font-bold text-xl hover:bg-surface-container-high transition-all">
                  {heroBtnSecondary}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
