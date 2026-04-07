import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileCheck, 
  Lock, 
  Trophy, 
  Gift, 
  Settings, 
  HelpCircle,
  Menu,
  X,
  Users,
  MessageSquare,
  Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export const AgentSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const user = session?.user as any;
  const userName = user?.name || user?.username || 'Agent';
  const role = user?.role || 'AGENT';
  const kycStatus = user?.kycStatus || 'PENDING';

  const MENU_ITEMS = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/agent' },
    { name: 'Referrals', icon: <Users size={20} />, href: '/agent/referrals' },
    { name: 'Nexus Feed', icon: <MessageSquare size={20} />, href: '/agent/chat' },
    { name: 'Raffle Arena', icon: <Trophy size={20} />, href: '/agent/raffle' },
  ];

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
        "fixed left-0 top-0 h-screen w-72 bg-slate-950 border-r border-white/5 flex flex-col py-8 z-[60] transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-8 mb-10 flex items-center justify-between">
          <Link href="/agent" className="text-2xl font-black text-primary font-headline tracking-tighter">
            Kinetic Vault
          </Link>
          <button 
            className="p-2 text-on-surface-variant hover:text-white lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col h-full px-4 space-y-2">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-full transition-all duration-300 group",
                  isActive 
                    ? "bg-primary/10 text-primary border-l-2 border-primary shadow-[0_0_20px_rgba(129,236,255,0.1)] font-bold" 
                    : "text-on-surface-variant hover:text-on-surface hover:bg-white/5 font-medium"
                )}
              >
                <span className={cn(isActive && "text-primary")}>{item.icon}</span>
                <span className="font-headline text-sm">{item.name}</span>
              </Link>
            );
          })}

          <div className="mt-auto pt-8 border-t border-white/5 space-y-2">
            <div className="px-4 py-4 mb-4 glass-card rounded-2xl flex items-center gap-3 bg-surface-container/20">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold">
                  {userName[0].toUpperCase()}
                </div>
                <div className={cn(
                  "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950",
                  kycStatus === 'APPROVED' ? "bg-emerald-500" : "bg-amber-500"
                )} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-on-surface truncate">{userName}</p>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest">{role}</p>
              </div>
            </div>
            
            {role === 'ADMIN' && (
              <Link href="/admin/cms" className="flex items-center gap-3 px-6 py-3 rounded-full text-secondary hover:text-white transition-all text-xs font-bold uppercase tracking-widest bg-secondary/5 border border-secondary/10">
                <Layout className="text-secondary" size={18} /> Frontend CMS
              </Link>
            )}
            <Link href="/agent/settings" className="flex items-center gap-3 px-6 py-3 rounded-full text-on-surface-variant hover:text-on-surface transition-all text-xs font-bold uppercase tracking-widest">
              <Settings size={18} /> Settings
            </Link>
            <Link href="/agent/help" className="flex items-center gap-3 px-6 py-3 rounded-full text-on-surface-variant hover:text-on-surface transition-all text-xs font-bold uppercase tracking-widest">
              <HelpCircle size={18} /> Support
            </Link>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all text-xs font-bold uppercase tracking-widest mt-6"
            >
              Secure Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
