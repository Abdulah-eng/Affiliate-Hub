import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
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
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export const AdminSidebar = () => {
  const pathname = usePathname();

  const MENU_ITEMS = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/admin' },
    { name: 'Brand Manager', icon: <Lock size={18} />, href: '/admin/brands' },
    { name: 'Review Queue', icon: <ShieldCheck size={18} />, href: '/admin/reviews' },
    { name: 'Review History', icon: <History size={18} />, href: '/admin/reviews/history' },
    { name: 'Agent Payouts', icon: <CreditCard size={18} />, href: '/admin/payouts' },
    { name: 'Quest Protocol', icon: <Radio size={18} />, href: '/admin/tasks' },
    { name: 'Promo Manager', icon: <Layout size={18} />, href: '/admin/promos' },
    { name: 'Raffle Matrix', icon: <Settings size={18} />, href: '/admin/raffle-settings' },
    { name: 'Global Broadcast', icon: <Radio size={18} />, href: '/admin/broadcast' },
    { name: 'Frontend CMS', icon: <Layout size={18} />, href: '/admin/cms' },
    { name: 'Audit Log', icon: <Database size={18} />, href: '/admin/audit' },
    { name: 'System Config', icon: <Settings size={18} />, href: '/admin/settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-surface-container-low shadow-2xl flex flex-col pt-20 pb-6 hidden md:flex border-r border-primary/5">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-20 h-20 flex items-center justify-center mb-2">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain scale-110" />
          </div>
          <div>
            <p className="text-primary font-black font-headline leading-none text-sm uppercase">Command Center</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1 font-bold italic">Admin Level Access</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-all rounded-r-full group relative overflow-hidden",
                isActive 
                  ? "bg-surface-container-high text-primary border-l-4 border-primary shadow-[0_0_20px_rgba(129,236,255,0.1)]" 
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 hover:translate-x-1"
              )}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.name}</span>
              {isActive && <div className="absolute right-4 w-1 h-4 bg-primary rounded-full blur-sm animate-pulse"></div>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pt-6 border-t border-outline-variant/10 space-y-1">
        <Link href="/admin/help" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 transition-all rounded-r-full text-xs font-medium">
          <HelpCircle size={16} /> Support
        </Link>
        <Link href="/admin/docs" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 transition-all rounded-r-full text-xs font-medium">
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
  );
};
