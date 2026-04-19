import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Trophy, 
  Gift, 
  Settings, 
  HelpCircle,
  X,
  Users,
  MessageSquare,
  Bomb,
  Swords,
  Sparkles,
  Target,
  Shield,
  Wallet,
  Rocket,
  Zap,
  Gamepad2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export const AgentSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [gamesOpen, setGamesOpen] = useState(pathname.startsWith('/agent/mines') || pathname.startsWith('/agent/raffle') || pathname.startsWith('/agent/luck') || pathname.startsWith('/agent/duels') || pathname.startsWith('/agent/clash') || pathname.startsWith('/agent/alliance'));
  
  const user = session?.user as any;
  const userName = user?.name || user?.username || 'Agent';
  const role = user?.role || 'AGENT';
  const kycStatus = user?.kycStatus || 'PENDING';

  const MAIN_MENU = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/agent' },
    { name: 'Leaderboard', icon: <Trophy size={20} />, href: '/agent/leaderboard' },
    { name: 'Brand Nexus', icon: <Rocket size={20} />, href: '/agent/platforms' },
    { name: 'Wallet', icon: <Wallet size={20} />, href: '/agent/wallet' },
    { name: 'Referrals', icon: <Users size={20} />, href: '/agent/referrals' },
    { name: 'Earn', icon: <Zap size={20} />, href: '/agent/earn' },
    { name: 'Nexus Feed', icon: <MessageSquare size={20} />, href: '/agent/chat' },
  ];

  const GAME_ARENA = [
    { name: 'Mines Arena', icon: <Bomb size={18} />, href: '/agent/mines' },
    { name: 'Raffle Arena', icon: <Gift size={18} />, href: '/agent/raffle' },
    { name: 'Luck Arena', icon: <Sparkles size={18} />, href: '/agent/luck' },
    { name: 'Kinetic Duels', icon: <Swords size={18} />, href: '/agent/duels' },
    { name: 'Kinetic Clash', icon: <Target size={18} />, href: '/agent/clash' },
    { name: 'K. Alliance', icon: <Shield size={18} />, href: '/agent/alliance' },
  ];

  const BOTTOM_MENU = [
    { name: 'Settings', icon: <Settings size={20} />, href: '/agent/settings' },
    { name: 'Support', icon: <HelpCircle size={20} />, href: '/agent/help' },
  ];

  const renderLink = (item: any, isSub: boolean = false) => {
    const isActive = pathname === item.href;
    return (
      <Link 
        key={item.href}
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={cn(
          "flex items-center gap-4 rounded-full transition-all duration-300 group",
          isSub ? "px-8 py-3 translate-x-2" : "px-6 py-3.5",
          isActive 
            ? "bg-primary/10 text-primary border-l-2 border-primary shadow-[0_0_20px_rgba(129,236,255,0.1)] font-bold" 
            : "text-on-surface-variant hover:text-on-surface hover:bg-white/5 font-medium"
        )}
      >
        <span className={cn("transition-colors duration-300", isActive ? "text-primary" : "group-hover:text-primary")}>
          {item.icon}
        </span>
        <span className={cn("font-headline tracking-tight", isSub ? "text-xs" : "text-sm")}>{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-screen w-72 bg-slate-950 border-r border-white/5 flex flex-col pt-8 pb-4 z-[60] transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-8 mb-6 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <p className="text-primary font-black font-headline text-lg tracking-tighter uppercase leading-none">Agent Dashboard</p>
            <p className="text-[10px] text-on-surface-variant font-bold tracking-widest uppercase mt-1">Affiliate Hub PH</p>
          </div>
          <button 
            className="p-2 text-on-surface-variant hover:text-white lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-1">
          {MAIN_MENU.map(item => renderLink(item))}

          {/* Collapsible GAME ARENA */}
          <div className="pt-2">
            <button 
              onClick={() => setGamesOpen(!gamesOpen)}
              className={cn(
                "w-full flex items-center justify-between px-6 py-3.5 rounded-full transition-all duration-300 group",
                gamesOpen ? "bg-white/5 text-primary" : "text-on-surface-variant hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-4">
                <Gamepad2 size={20} className={cn("transition-colors", gamesOpen ? "text-primary" : "group-hover:text-primary")} />
                <span className="font-headline text-sm tracking-tight">Game Arena</span>
              </div>
              {gamesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {gamesOpen && (
              <div className="mt-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
                {GAME_ARENA.map(item => renderLink(item, true))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/5 mt-2">
            {BOTTOM_MENU.map(item => renderLink(item))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 px-4 pb-4 shrink-0 space-y-2">
          <div className="px-4 py-3 glass-card rounded-2xl flex items-center gap-3 bg-white/5">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold text-sm">
                {userName[0].toUpperCase()}
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950",
                kycStatus === 'APPROVED' ? "bg-emerald-500" : "bg-amber-500"
              )} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-on-surface truncate">{userName}</p>
              <p className="text-[9px] text-primary font-black uppercase tracking-widest">{role}</p>
            </div>
          </div>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all text-[10px] font-black uppercase tracking-widest"
          >
            Secure Logout
          </button>
        </div>
      </aside>
    </>
  );
};
