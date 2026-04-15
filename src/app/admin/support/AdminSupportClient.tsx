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
  ArrowLeft,
  Paperclip,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendSupportMessage, getTicketMessages, adminResolveTicket, uploadSupportAsset } from "@/app/actions/support";
import { useRouter } from "next/navigation";

export default function AdminSupportClient({ initialTickets }: { initialTickets: any[] }) {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleSend = (attachmentUrl?: string, attachmentType?: string) => {
    if ((!input.trim() && !attachmentUrl) || !selectedTicket || isPending) return;

    startTransition(async () => {
      const content = input;
      setInput("");
      const res = await sendSupportMessage(selectedTicket.id, content, attachmentUrl, attachmentType);
      if (res.success) {
        loadMessages(selectedTicket.id);
      }
    });
  };

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTicket) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadSupportAsset(formData);
    if (res.success && res.url) {
      handleSend(res.url, res.type);
    } else {
      alert("Upload failed: " + (res.error || "Please check the file size and try again."));
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    <div className="flex flex-col lg:flex-row gap-8 h-[700px]">
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
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-primary font-black border group-hover:scale-110 transition-transform",
                ticket.userId ? "bg-surface-container-high border-primary/10" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
              )}>
                {ticket.user?.name?.[0] || ticket.user?.username?.[0] || ticket.guestName?.[0] || "G"}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs font-black truncate uppercase tracking-tight flex items-center gap-1.5",
                  ticket.userId ? "text-on-surface" : "text-amber-500"
                )}>
                  {ticket.userId ? `@${ticket.user?.username || ticket.user?.name || ticket.userId.slice(0, 8)}` : `[GUEST] ${ticket.guestName || ticket.guestId?.slice(0,8)}`}
                </p>
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
                <h4 className="text-xs font-black uppercase text-on-surface tracking-widest">
                  Synchronizing: {selectedTicket.userId ? `@${selectedTicket.user?.username || selectedTicket.user?.name || selectedTicket.userId.slice(0, 8)}` : `${selectedTicket.guestName} (${selectedTicket.guestEmail || "No Email"})`}
                </h4>
                <p className="text-[10px] text-on-surface-variant font-black flex items-center gap-1.5 ">
                  <span className={cn("w-1.5 h-1.5 rounded-full", selectedTicket.userId ? "bg-emerald-500" : "bg-amber-500")}></span> 
                  {selectedTicket.userId ? "AUTHENTICATED AGENT" : "UNAUTHENTICATED GUEST"}
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
                  "px-5 py-3 rounded-2xl text-sm flex flex-col gap-2 shadow-xl",
                  msg.isAdmin 
                    ? "bg-primary text-slate-950 font-bold rounded-tr-none shadow-primary/10" 
                    : "bg-surface-container border border-outline-variant/30 text-on-surface rounded-tl-none font-medium"
                )}>
                  {msg.attachmentUrl && (
                    <div className="rounded-lg overflow-hidden border border-black/10 bg-black/5 mb-1 max-w-full">
                      {msg.attachmentType?.startsWith('image/') ? (
                        <img 
                          src={msg.attachmentUrl} 
                          alt="Attachment" 
                          className="max-h-60 w-auto object-contain cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                          onClick={() => window.open(msg.attachmentUrl, '_blank')}
                        />
                      ) : (
                        <a 
                          href={msg.attachmentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 text-[10px] uppercase font-black tracking-widest"
                        >
                          <Paperclip size={14} /> Open Secure Asset
                        </a>
                      )}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest mt-2 opacity-30">
                  {msg.isAdmin ? "Nexus Command" : (selectedTicket.userId ? "Agent" : "Guest")} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          <div className="p-6 bg-slate-950/40 border-t border-white/5">
            <div className="flex gap-4 items-end">
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={onFileSelect}
                accept="image/*,application/pdf"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isPending}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl text-on-surface-variant hover:text-primary transition-all active:scale-90"
                title="Send Logistic Asset"
              >
                {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Paperclip size={24} />}
              </button>

              <div className="relative flex-1">
                <textarea 
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Relay tactical directive..."
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 pr-16 text-sm outline-none focus:border-primary transition-all font-medium h-14 no-scrollbar resize-none"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !isUploading) || isPending}
                  className="absolute right-2 bottom-2 p-3 bg-primary text-slate-950 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-primary/20"
                >
                  {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center animate-pulse">
          <ShieldAlert size={80} className="mb-6 text-primary" />
          <h3 className="text-xl font-black uppercase tracking-[0.4em] text-on-surface">Initialize Uplink Synchronization</h3>
          <p className="text-xs font-bold uppercase tracking-widest mt-2">Select a communication node from the queue</p>
        </div>
      )}
    </div>
  );
}
