"use client";

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  Headphones,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { getOrCreateSupportTicket, sendSupportMessage, getTicketMessages, uploadSupportAsset } from '@/app/actions/support';
import { useSession } from 'next-auth/react';

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or fetch ticket
  const initializeSupport = async () => {
    setLoading(true);
    let guestInfo = undefined;
    
    if (!session?.user) {
      let guestId = localStorage.getItem('nexus_support_guest_id');
      if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem('nexus_support_guest_id', guestId);
      }
      guestInfo = { guestId };
    }

    const res = await getOrCreateSupportTicket(guestInfo);
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
      }, 3000); // Polling every 3s for "live" feel
    } else {
      if (pollInterval.current) clearInterval(pollInterval.current);
    }

    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, [isOpen, ticket, messages.length, session]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (attachmentUrl?: string, attachmentType?: string) => {
    if ((!input.trim() && !attachmentUrl) || !ticket || isPending) return;

    startTransition(async () => {
      const content = input;
      setInput("");
      const res = await sendSupportMessage(ticket.id, content, attachmentUrl, attachmentType);
      if (res.success) {
        const updatedMsgs = await getTicketMessages(ticket.id);
        setMessages(updatedMsgs);
      }
    });
  };

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ticket) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadSupportAsset(formData);
    if (res.success && res.url) {
      handleSend(res.url, res.type);
    } else {
      alert("Upload failed: " + (res.error || "Please check your file size (max 10MB) and try again."));
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <GlassCard className="w-[350px] sm:w-[500px] h-[600px] mb-4 overflow-hidden border-primary/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <Headphones size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-tight text-on-surface">Support Pulse</h4>
                <div className="flex items-center gap-1.5 ">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest">Active Node Uplink</span>
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
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface">Initialize Transmission</p>
                <p className="text-[9px] font-medium mt-1 leading-relaxed">State your inquiry or upload evidence. Uplink is ready.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.isAdmin ? "mr-auto items-start font-medium" : "ml-auto items-end"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-xs flex flex-col gap-2",
                    msg.isAdmin 
                      ? "bg-white/5 border border-white/10 text-on-surface rounded-tl-none" 
                      : "bg-primary text-slate-950 font-bold rounded-tr-none shadow-[0_5px_15px_rgba(129,236,255,0.2)]"
                  )}>
                    {msg.attachmentUrl && (
                      <div className="rounded-lg overflow-hidden border border-black/10 bg-black/5 mb-1 max-w-full">
                        {msg.attachmentType?.startsWith('image/') ? (
                          <img 
                            src={msg.attachmentUrl} 
                            alt="Attachment" 
                            className="max-h-60 w-auto object-contain cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                            onClick={() => window.open(msg.attachmentUrl, '_blank')}
                          />
                        ) : (
                          <a 
                            href={msg.attachmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 text-[10px] uppercase font-bold"
                          >
                            <Paperclip size={14} /> View Document
                          </a>
                        )}
                      </div>
                    )}
                    {msg.content}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-30">
                    {msg.isAdmin ? "Nexus Operative" : (session?.user?.name || "Guest Node")} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/5 bg-slate-950/20">
            <div className="flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={onFileSelect}
                accept="image/*,application/pdf"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || !ticket}
                className="p-3 bg-white/5 border border-white/10 rounded-xl text-on-surface-variant hover:text-primary transition-all active:scale-90"
                title="Attach Evidence"
              >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
              </button>
              
              <div className="relative flex-1">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Sync directive..."
                  className="w-full h-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs outline-none focus:border-primary transition-all font-medium"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !isUploading) || isPending || !ticket}
                  className="absolute right-2 top-1.5 p-2 text-primary hover:text-white disabled:opacity-30 disabled:hover:text-primary transition-colors"
                >
                  {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
            <p className="text-[8px] text-center text-on-surface-variant mt-3 font-black uppercase tracking-widest opacity-30">
              End-to-End Secure Uplink Established
            </p>
          </div>
        </GlassCard>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl relative group",
            "bg-primary text-slate-950 hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(129,236,255,0.3)]"
          )}
        >
          <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <Headphones size={28} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-bounce" />
        </button>
      )}
    </div>
  );
}
