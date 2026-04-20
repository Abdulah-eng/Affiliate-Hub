"use client";

import React, { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Headphones,
  Paperclip,
  ArrowLeft,
  User as UserIcon,
  Mail,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { getOrCreateSupportTicket, sendSupportMessage, getTicketMessages, uploadSupportAsset } from '@/app/actions/support';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function SupportPage() {
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [guestForm, setGuestForm] = useState({ name: "", email: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or fetch ticket
  const initializeSupport = useCallback(async (forceGuestInfo?: any) => {
    setLoading(true);
    let guestInfo = forceGuestInfo;
    
    if (!session?.user && !guestInfo) {
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
      setFormSubmitted(true);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    initializeSupport();
  }, [initializeSupport]);

  useEffect(() => {
    if (ticket) {
      pollInterval.current = setInterval(async () => {
        const newMsgs = await getTicketMessages(ticket.id);
        if (newMsgs.length !== messages.length) {
          setMessages(newMsgs);
        }
      }, 5000);
    }

    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, [ticket, messages.length]);

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
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let guestId = localStorage.getItem('nexus_support_guest_id');
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem('nexus_support_guest_id', guestId);
    }
    initializeSupport({ guestId, ...guestForm });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-4xl w-full z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-vapor">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-2">
              <ArrowLeft size={16} /> Return to Network
            </Link>
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
              Support <span className="text-primary tracking-normal">Uplink</span>
            </h1>
            <p className="text-on-surface-variant max-w-xl text-lg font-medium">
              Direct synchronization with Nexus Operatives. End-to-end encrypted protocol for high-priority inquiries.
            </p>
          </div>
          <div className="hidden md:block">
             <div className="px-6 py-3 bg-surface-container-high rounded-2xl border border-outline-variant/30 flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">Operatives Static: Active</span>
             </div>
          </div>
        </div>

        {/* Guest Form or Chat */}
        {!session?.user && !formSubmitted && !loading ? (
          <GlassCard className="p-8 md:p-12 animate-vapor" style={{ animationDelay: '0.2s' }}>
             <form onSubmit={handleGuestSubmit} className="max-w-md mx-auto space-y-8">
                <div className="text-center space-y-2 mb-10">
                   <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20">
                      <Zap size={32} />
                   </div>
                   <h2 className="text-2xl font-black font-headline uppercase tracking-tight">Identification Required</h2>
                   <p className="text-on-surface-variant text-sm font-medium">Please provide a temporary alias to begin synchronization.</p>
                </div>

                <div className="space-y-4">
                   <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
                      <input 
                        required
                        type="text"
                        placeholder="TACNAME / Alias"
                        value={guestForm.name}
                        onChange={(e) => setGuestForm({...guestForm, name: e.target.value})}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold outline-none focus:border-primary transition-all"
                      />
                   </div>
                   <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
                      <input 
                        required
                        type="email"
                        placeholder="Secure Uplink Email"
                        value={guestForm.email}
                        onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold outline-none focus:border-primary transition-all"
                      />
                   </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-primary text-background rounded-2xl font-black uppercase tracking-[0.3em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(129,236,255,0.3)]"
                >
                   Initialize Session
                </button>
                <p className="text-[10px] text-center text-on-surface-variant font-bold uppercase tracking-widest opacity-40">
                   Anonymous data processing enabled
                </p>
             </form>
          </GlassCard>
        ) : (
          <GlassCard className="h-[650px] flex flex-col overflow-hidden animate-vapor border-primary/10" style={{ animationDelay: '0.2s' }}>
            {/* Messages Feed */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
            >
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="text-primary animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Syncing Cryptographic Keys...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-12">
                  <MessageSquare size={80} className="mb-8 text-primary" />
                  <p className="text-2xl font-black font-headline uppercase tracking-[0.3em] text-on-surface">Channel Clear</p>
                  <p className="text-sm font-medium mt-4 leading-relaxed max-w-sm">No transmissions detected. State your inquiry or upload evidence to synchronize with the next available operative.</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[80%] md:max-w-[70%]",
                      msg.isAdmin ? "mr-auto items-start font-medium" : "ml-auto items-end"
                    )}
                  >
                    <div className={cn(
                      "px-6 py-4 rounded-3xl text-sm flex flex-col gap-3 shadow-xl",
                      msg.isAdmin 
                        ? "bg-surface-container-low border border-outline-variant/20 text-on-surface rounded-tl-none" 
                        : "bg-primary text-slate-950 font-bold rounded-tr-none shadow-primary/20"
                    )}>
                      {msg.attachmentUrl && (
                        <div className="rounded-xl overflow-hidden border border-black/10 bg-black/5 mb-1 max-w-full">
                          {msg.attachmentType?.startsWith('image/') ? (
                            <img 
                              src={msg.attachmentUrl} 
                              alt="Attachment" 
                              className="max-h-96 w-auto object-contain cursor-pointer transition-all hover:brightness-110 active:scale-95"
                              onClick={() => window.open(msg.attachmentUrl, '_blank')}
                            />
                          ) : (
                            <a 
                              href={msg.attachmentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 px-6 py-4 text-xs tracking-widest uppercase font-black"
                            >
                              <Paperclip size={18} /> Download Evidence File
                            </a>
                          )}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 px-2 opacity-40">
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {msg.isAdmin ? "Nexus Command" : (session?.user?.name || ticket?.guestName || "Guest Node")}
                      </span>
                      <span className="text-[8px]">•</span>
                      <span className="text-[10px] uppercase font-bold">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-outline-variant/10 bg-surface-container-lowest/50 backdrop-blur-md">
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
                  disabled={isUploading || !ticket}
                  className="p-5 bg-surface-container border border-outline-variant/30 rounded-2xl text-on-surface-variant hover:text-primary transition-all active:scale-90 flex-shrink-0"
                  title="Attach Tactical Assets"
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
                    placeholder="Enter synchronization directive..."
                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-5 pl-6 pr-16 text-sm font-bold outline-none focus:border-primary transition-all resize-none max-h-32"
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={(!input.trim() && !isUploading) || isPending || !ticket}
                    className="absolute right-3 bottom-3 p-3 bg-primary text-background rounded-xl hover:bg-primary/90 disabled:opacity-20 transition-all shadow-lg"
                  >
                    {isPending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                 <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em] opacity-40">
                    Neural Synchronization: Encrypted
                 </p>
                 {formSubmitted && !session && (
                    <button 
                      onClick={() => { localStorage.removeItem('nexus_support_guest_id'); window.location.reload(); }}
                      className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-widest transition-colors"
                    >
                       Reset Session
                    </button>
                 )}
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Footer Branding */}
      <div className="mt-12 text-center opacity-20 hover:opacity-100 transition-opacity duration-1000">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-on-surface">Affiliate Hub Security Protocol v44.20.1</p>
      </div>
    </div>
  );
}
