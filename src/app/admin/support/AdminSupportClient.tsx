"use client";

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  CheckCircle2, 
  Send, 
  Loader2, 
  User, 
  Trash2,
  AlertCircle,
  MessageSquare,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendSupportMessage, getTicketMessages, adminResolveTicket } from "@/app/actions/support";
import { useRouter } from "next/navigation";

export default function AdminSupportClient({ initialTickets }: { initialTickets: any[] }) {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
      const interval = setInterval(() => loadMessages(selectedTicket.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedTicket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async (id: string) => {
    const msgs = await getTicketMessages(id);
    setMessages(msgs);
  };

  const handleSend = () => {
    if (!input.trim() || !selectedTicket || isPending) return;

    startTransition(async () => {
      const content = input;
      setInput("");
      const res = await sendSupportMessage(selectedTicket.id, content);
      if (res.success) {
        loadMessages(selectedTicket.id);
      }
    });
  };

  const handleResolve = () => {
    if (!selectedTicket || isPending) return;
    if (!confirm("Confirm resolution? This will archive the thread for agents.")) return;

    startTransition(async () => {
      const res = await adminResolveTicket(selectedTicket.id);
      if (res.success) {
        setSelectedTicket(null);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[600px]">
      {/* Ticket List */}
      <GlassCard className={cn(
        "lg:w-1/3 overflow-y-auto no-scrollbar border-white/5",
        selectedTicket ? "hidden lg:block" : "w-full"
      )}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <h3 className="text-sm font-black uppercase text-on-surface tracking-widest">Inquiry Queue</h3>
           <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-full">{initialTickets.length}</span>
        </div>
        <div className="divide-y divide-white/5">
          {initialTickets.map((ticket) => (
            <div 
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={cn(
                "p-6 hover:bg-white/[0.03] transition-all cursor-pointer group flex items-start gap-4",
                selectedTicket?.id === ticket.id ? "bg-primary/5 border-l-2 border-primary" : ""
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-black border border-primary/10 group-hover:scale-110 transition-transform">
                {ticket.user?.name?.[0] || ticket.user?.username?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-on-surface truncate uppercase tracking-tight">@{ticket.user?.username}</p>
                <p className="text-[10px] text-on-surface-variant line-clamp-1 mt-1 font-medium italic opacity-60">
                  {ticket.messages[0]?.content || "Empty uplink..."}
                </p>
                <div className="flex items-center justify-between mt-3">
                   <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                     {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                   <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Ready for Sync</span>
                </div>
              </div>
            </div>
          ))}

          {initialTickets.length === 0 && (
            <div className="p-10 text-center opacity-30 flex flex-col items-center gap-4">
               <CheckCircle2 size={40} />
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">All Systems Nominal</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Chat Area */}
      {selectedTicket ? (
        <GlassCard className="flex-1 flex flex-col overflow-hidden border-primary/10">
          <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedTicket(null)}
                className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-on-surface-variant"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h4 className="text-xs font-black uppercase text-on-surface tracking-widest">Synchronizing: @{selectedTicket.user?.username}</h4>
                <p className="text-[10px] text-on-surface-variant font-black flex items-center gap-1.5 ">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ACTIVE NODE UPLINK
                </p>
              </div>
            </div>
            <button 
              onClick={handleResolve}
              disabled={isPending}
              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
            >
              {isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              Resolve
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-slate-950/20"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  msg.isAdmin ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "px-5 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.isAdmin 
                    ? "bg-primary text-slate-950 font-bold rounded-tr-none shadow-[0_5px_15px_rgba(129,236,255,0.1)]" 
                    : "bg-white/5 border border-white/10 text-on-surface rounded-tl-none font-medium"
                )}>
                  {msg.content}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest mt-2 opacity-30">
                  {msg.isAdmin ? "Administrator" : "Agent"} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          <div className="p-6 bg-slate-950/40 border-t border-white/5">
            <div className="relative">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Compose directive..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-5 pr-16 text-sm outline-none focus:border-primary transition-all font-medium h-24 no-scrollbar resize-none"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isPending}
                className="absolute right-4 bottom-4 p-3 bg-primary text-slate-950 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
              >
                {isPending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </GlassCard>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center animate-pulse">
          <MessageSquare size={80} className="mb-6" />
          <h3 className="text-xl font-black uppercase tracking-[0.4em]">Select Node to Synchronize</h3>
        </div>
      )}
    </div>
  );
}
