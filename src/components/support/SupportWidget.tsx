"use client";

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  ShieldCheck, 
  Headphones,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { getOrCreateSupportTicket, sendSupportMessage, getTicketMessages } from '@/app/actions/support';

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize or fetch ticket
  const initializeSupport = async () => {
    setLoading(true);
    const res = await getOrCreateSupportTicket();
    if (res.success) {
      setTicket(res.ticket);
      setMessages(res.ticket?.messages || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      if (!ticket) {
        initializeSupport();
      }
      
      // Start polling for new messages when open
      pollInterval.current = setInterval(async () => {
        if (ticket) {
          const newMsgs = await getTicketMessages(ticket.id);
          if (newMsgs.length !== messages.length) {
            setMessages(newMsgs);
          }
        }
      }, 5000);
    } else {
      if (pollInterval.current) clearInterval(pollInterval.current);
    }

    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, [isOpen, ticket, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !ticket || isPending) return;

    startTransition(async () => {
      const content = input;
      setInput("");
      const res = await sendSupportMessage(ticket.id, content);
      if (res.success) {
        // Optimistic update would be better, but we'll wait for poll/refresh
        const updatedMsgs = await getTicketMessages(ticket.id);
        setMessages(updatedMsgs);
      }
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <GlassCard className="w-[350px] sm:w-[400px] h-[500px] mb-4 overflow-hidden border-primary/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <Headphones size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-tight text-on-surface">Support Node</h4>
                <div className="flex items-center gap-1.5 ">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest">Active Operative Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/5 rounded-lg text-on-surface-variant transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Feed */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
          >
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 size={24} className="text-primary animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 px-6">
                <MessageSquare size={48} className="mb-4 text-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface">Initialize Uplink</p>
                <p className="text-[9px] font-medium mt-1 leading-relaxed">State your inquiry below to begin synchronization with a support operative.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.isAdmin ? "mr-auto items-start" : "ml-auto items-end"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-xs font-medium leading-relaxed",
                    msg.isAdmin 
                      ? "bg-white/5 border border-white/10 text-on-surface rounded-tl-none" 
                      : "bg-primary text-slate-950 font-bold rounded-tr-none shadow-[0_5px_15px_rgba(129,236,255,0.2)]"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-30">
                    {msg.isAdmin ? "Operative" : "You"} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/5 bg-slate-950/20">
            <div className="relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Transmission details..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs outline-none focus:border-primary transition-all font-medium"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isPending || !ticket}
                className="absolute right-2 top-1.5 p-2 text-primary hover:text-white disabled:opacity-30 disabled:hover:text-primary transition-colors"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p className="text-[8px] text-center text-on-surface-variant mt-2 font-black uppercase tracking-widest opacity-40">
              Encrypted Synchronization Active
            </p>
          </div>
        </GlassCard>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl relative group",
          isOpen 
            ? "bg-slate-900 text-white border border-white/10 rotate-90" 
            : "bg-primary text-slate-950 hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(129,236,255,0.3)]"
        )}
      >
        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={28} /> : <Headphones size={28} />}
        {!isOpen && (
           <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-bounce" />
        )}
      </button>
    </div>
  );
}
