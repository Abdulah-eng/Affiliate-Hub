"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Smile, 
  Paperclip, 
  Image as ImageIcon,
  CheckCheck,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendMessage } from "@/app/actions/chat";

type Message = {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userRole: string;
  createdAt: string;
  rewardPoints: number;
};

export function ChatClient({ 
  initialMessages, 
  currentUserId 
}: { 
  initialMessages: Message[]; 
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Polling for new messages (Simple implementation)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/chat/sync");
        if (res.ok) {
          const data = await res.json();
          // Merge and deduplicate (assuming data is sorted by date)
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newOnes = data.filter((m: Message) => !existingIds.has(m.id));
            if (newOnes.length === 0) return prev;
            return [...prev, ...newOnes].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });
        }
      } catch (e) {
        console.error("Sync error:", e);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    setIsSending(true);
    
    try {
      const result = await sendMessage(input);
      if (result.success && result.message) {
        setInput("");
        // Optimistic update handled by polling or manual append
        setMessages(prev => [...prev, {
          id: result.message.id,
          content: result.message.content,
          userId: currentUserId,
          userName: "You",
          userRole: "AGENT", // Default
          createdAt: new Date().toISOString(),
          rewardPoints: result.message.rewardPoints
        }]);
      }
    } catch (e) {
      console.error("Send error:", e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#0f172a] to-[#080d1a] rounded-3xl border border-[#1e293b] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_0_80px_rgba(129,236,255,0.02)] relative">
      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-10 py-8 space-y-10 no-scrollbar scroll-smooth"
      >
        {messages.map((msg) => {
          const isSelf = msg.userId === currentUserId;
          return (
            <div key={msg.id} className={cn(
              "flex gap-5 max-w-[85%] animate-vapor",
              isSelf ? "flex-row-reverse ml-auto" : "flex-row"
            )}>
              <div className="shrink-0 relative h-fit">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary font-bold border border-primary/20 ring-2 ring-white/5 uppercase">
                  {msg.userName?.[0]}
                </div>
                <div className={cn(
                  "absolute -bottom-1 px-1.5 rounded-sm text-[8px] font-black uppercase tracking-tighter",
                  isSelf ? "bg-primary text-background left-0" : "bg-tertiary right-0 text-white"
                )}>
                  {msg.userRole}
                </div>
              </div>
              <div className={cn("space-y-2", isSelf ? "text-right" : "text-left")}>
                <div className={cn("flex items-center gap-3", isSelf ? "justify-end" : "justify-start")}>
                  {!isSelf && <span className="text-sm font-black text-on-surface uppercase tracking-tight">{msg.userName}</span>}
                  <span className="text-[10px] font-black text-on-surface-variant opacity-40">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isSelf && <span className="text-sm font-black text-primary uppercase tracking-tight">You</span>}
                </div>
                <div className={cn(
                  "p-5 rounded-3xl relative group border transition-all backdrop-blur-md shadow-2xl hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]",
                  isSelf 
                    ? "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 shadow-[0_10px_30px_rgba(129,236,255,0.15)] rounded-tr-none text-on-surface" 
                    : "bg-gradient-to-br from-white/10 to-white/5 border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)] rounded-tl-none text-on-surface-variant/90"
                )}>
                  <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                  {msg.rewardPoints > 0 && (
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                       <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-2 py-1 rounded-full border border-emerald-500/30 shadow-lg">+{msg.rewardPoints} PTS</span>
                    </div>
                  )}
                  {isSelf && <div className="flex justify-end mt-2"><CheckCheck size={14} className="text-primary opacity-60" /></div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-8 bg-gradient-to-t from-background/40 to-transparent border-t border-white/5 relative z-10 backdrop-blur-sm">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="bg-surface-container-high/60 border border-white/10 p-3 rounded-3xl flex items-center gap-3 focus-within:border-primary/40 focus-within:bg-surface-container-high/90 focus-within:shadow-[0_10px_40px_rgba(129,236,255,0.15)] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3),inset_0_2px_15px_rgba(255,255,255,0.05)] group backdrop-blur-lg"
        >
           <button type="button" onClick={() => alert("File attachment upload coming soon")} className="p-3 text-on-surface-variant hover:text-primary transition-colors hover:bg-white/5 rounded-2xl">
             <Paperclip size={20} />
           </button>
           <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/30" 
            placeholder="Sync a message to the Nexus..." 
           />
           <div className="flex items-center gap-2 pr-2">
              <button type="button" onClick={() => alert("Emoji picker coming soon")} className="p-3 text-on-surface-variant hover:text-primary transition-colors hover:bg-white/5 rounded-2xl hidden md:block">
                <Smile size={20} />
              </button>
              <button 
                type="submit" 
                disabled={isSending || !input.trim()}
                className="bg-primary text-background px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:shadow-[0_0_30px_rgba(129,236,255,0.4)] transition-all active:scale-95 group-hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
              >
                 {isSending ? <Loader2 size={16} className="animate-spin" /> : <>Send <Send size={16} /></>}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
