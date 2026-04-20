import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  CreditCard, 
  HelpCircle, 
  FileText, 
  LogOut,
  ChevronRight,
  Database,
  Lock,
  Settings,
  History,
  Layout,
  Radio,
  X,
  Trophy,
  Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { getAdminSidebarStats } from '@/app/actions/admin';
import Image from 'next/image';

export const AdminSidebar = ({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (val: boolean) => void }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [stats, setStats] = useState({ pendingKyc: 0, pendingMissions: 0, openTickets: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getAdminSidebarStats();
      setStats(data);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const isCSR = session?.user?.role === 'CSR';

  const ALL_MENU_ITEMS = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/admin', roles: ['ADMIN', 'CSR', 'SEMI_ADMIN'] },
    { name: 'Leaderboard', icon: <Trophy size={18} />, href: '/admin/leaderboard', roles: ['ADMIN', 'CSR', 'SEMI_ADMIN'] },
    { name: 'Redemptions', icon: <CreditCard size={18} />, href: '/admin/redemptions', roles: ['ADMIN', 'CSR', 'SEMI_ADMIN'] },
    { name: 'Platform Manager', icon: <Lock size={18} />, href: '/admin/brands', roles: ['ADMIN', 'CSR', 'SEMI_ADMIN'] },
    { name: 'Review Queue', icon: <ShieldCheck size={18} />, href: '/admin/reviews', roles: ['ADMIN', 'CSR', 'SEMI_ADMIN'], badge: stats.pendingKyc },
    { name: 'Mission Reviews', icon: <Trophy size={18} />, href: '/admin/reviews/missions', roles: ['ADMIN', 'CSR', 'SEMI_ADMIN'], badge: stats.pendingMissions },
    { name: 'Support Pulse', icon: <Headphones size={18} />, href: '/admin/support', roles: ['ADMIN', 'CSR', 'SEMI_ADMIN'], badge: stats.openTickets },
    { name: 'Review History', icon: <History size={18} />, href: '/admin/reviews/history', roles: ['ADMIN', 'CSR', 'SEMI_ADMIN'] },
    { name: 'Agent Payouts', icon: <CreditCard size={18} />, href: '/admin/payouts', roles: ['ADMIN', 'SEMI_ADMIN'] },
    { name: 'Quest Protocol', icon: <Radio size={18} />, href: '/admin/tasks', roles: ['ADMIN', 'CSR', 'SEMI_ADMIN'] },
    { name: 'Promo Manager', icon: <Layout size={18} />, href: '/admin/promos', roles: ['ADMIN', 'CSR', 'SEMI_ADMIN'] },
    { name: 'Raffle Matrix', icon: <Settings size={18} />, href: '/admin/raffle-settings', roles: ['ADMIN', 'SEMI_ADMIN'] },
    { name: 'Global Broadcast', icon: <Radio size={18} />, href: '/admin/broadcast', roles: ['ADMIN', 'CSR', 'SEMI_ADMIN'] },
    { name: 'Frontend CMS', icon: <Layout size={18} />, href: '/admin/cms', roles: ['ADMIN', 'CSR', 'SEMI_ADMIN'] },
    { name: 'Audit Log', icon: <Database size={18} />, href: '/admin/audit', roles: ['ADMIN', 'SEMI_ADMIN'] },
    { name: 'System Config', icon: <Settings size={18} />, href: '/admin/settings', roles: ['ADMIN', 'SEMI_ADMIN', 'CSR'] },
  ];

  const MENU_ITEMS = ALL_MENU_ITEMS.filter(item => item.roles.includes(session?.user?.role || ''));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && setIsOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[55] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 z-[60] bg-surface-container-low shadow-2xl flex flex-col pt-20 pb-6 border-r border-primary/5 transition-transform duration-300 md:translate-x-0 md:flex",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="relative h-20 w-48 flex items-center justify-center -ml-2">
              <Image 
                src="/WhatsApp_Image_2026-04-11_at_01.17.27-removebg-preview.png" 
                alt="Logo" 
                width={200}
                height={100}
                className="object-contain h-full w-auto scale-110" 
                priority
              />
            </Link>
            {setIsOpen && (
              <button 
                className="p-2 text-on-surface-variant hover:text-white md:hidden cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </button>
            )}
          </div>
          <div>
            <p className="text-primary font-black font-headline leading-none text-xs uppercase tracking-widest">Command Center</p>
            <p className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] mt-1 font-bold italic">
              {isCSR ? 'Field Operations (CSR)' : 'Admin Level Access'}
            </p>
          </div>
        </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen && setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-all rounded-r-full group relative overflow-hidden",
                isActive 
                  ? "bg-surface-container-high text-primary border-l-4 border-primary shadow-[0_0_20px_rgba(129,236,255,0.1)]" 
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 hover:translate-x-1"
              )}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.name}</span>
              
              {item.badge && item.badge > 0 ? (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                  {item.badge}
                </span>
              ) : null}

              {isActive && <div className="absolute right-4 w-1 h-4 bg-primary rounded-full blur-sm animate-pulse"></div>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pt-6 border-t border-outline-variant/10 space-y-1">
        <Link href="/admin/help" onClick={() => setIsOpen && setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 transition-all rounded-r-full text-xs font-medium">
          <HelpCircle size={16} /> Support
        </Link>
        <Link href="/admin/docs" onClick={() => setIsOpen && setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 transition-all rounded-r-full text-xs font-medium">
          <FileText size={16} /> Documentation
        </Link>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all text-xs font-bold uppercase tracking-widest active:scale-95 group"
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
          Secure Logout
        </button>
      </div>
      
      {/* Visual background edge glow */}
      <div className="absolute right-[-1px] top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
      </aside>
    </>
  );
};

