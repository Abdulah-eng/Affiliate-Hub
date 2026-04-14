import { adminGetPendingTickets } from "@/app/actions/support";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Headphones, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Eye, 
  History,
  Info
} from "lucide-react";
import AdminSupportClient from "./AdminSupportClient";

export const dynamic = 'force-dynamic';

export default async function AdminSupportPage() {
  const tickets = await adminGetPendingTickets();

  return (
    <div className="animate-vapor">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
            Support <span className="text-primary tracking-normal">Pulse</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg font-medium mt-4">
            Direct synchronization with agents. Resolve inquiries and manage node health.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <GlassCard className="p-6 flex items-center gap-4 bg-primary/5 border-primary/20">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(129,236,255,0.1)]">
            <MessageCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Active Inquiries</p>
            <p className="text-3xl font-black text-on-surface">{tickets.length}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4 bg-emerald-500/5 border-emerald-500/10 opacity-60 hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Resolved Today</p>
            <p className="text-3xl font-black text-on-surface">12</p>
          </div>
        </GlassCard>
      </div>

      <AdminSupportClient initialTickets={tickets} />
    </div>
  );
}
