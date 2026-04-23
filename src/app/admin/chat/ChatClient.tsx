"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Smile, 
  Paperclip, 
  Image as ImageIcon,
  CheckCheck,
  Loader2,
  MoreVertical,
  ThumbsUp,
  AlertTriangle,
  Star,
  Heart,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendMessage, uploadChatAsset, deleteChatMessage } from "@/app/actions/chat";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useNotificationSound } from "@/hooks/useNotificationSound";

type Message = {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userRole: string;
  createdAt: string;
  rewardPoints: number;
  reactions?: { userId: string, type: string }[];
  isSpam?: boolean;
  isHelpful?: boolean;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
};

export function ChatClient({ 
  initialMessages, 
  currentUserId,
  userRole
}: { 
  initialMessages: Message[]; 
  currentUserId: string;
  userRole?: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ msgId: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playNotification = useNotificationSound();
  const lastMessageCount = useRef(initialMessages.length);

  // Auto-scroll to bottom and play sound for new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    if (messages.length > lastMessageCount.current) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.userId !== currentUserId) {
         playNotification();
      }
    }
    lastMessageCount.current = messages.length;
  }, [messages, currentUserId, playNotification]);

  // Polling for new messages (Simple implementation)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/chat/sync");
        if (res.ok) {
          const data = await res.json();
          // Merge and deduplicate (assuming data is sorted by date)
          // Merge and deduplicate
          setMessages(prev => {
            const combined = [...prev, ...data];
            const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
            return unique.sort((a, b) => 
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

  // Click outside handler for Emoji Picker and Context Menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (contextMenu && !(event.target as HTMLElement).closest('.context-menu-container')) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenu]);

  const onEmojiClick = (emojiData: any) => {
    setInput(prev => prev + emojiData.emoji);
    // Keep focus (optional, but good UX)
  };

  const handleSend = async (attachmentUrl?: string, attachmentType?: string) => {
    if ((!input.trim() && !attachmentUrl) || isSending) return;
    setIsSending(true);
    
    try {
      const result = await sendMessage(input, attachmentUrl, attachmentType);
      if (result.success && result.message) {
        if (!attachmentUrl) setInput("");
        // Optimistic update handled by polling or manual append
        setMessages(prev => {
          if (prev.some(m => m.id === result.message.id)) return prev;
          const createdAt = result.message.createdAt instanceof Date 
            ? result.message.createdAt.toISOString() 
            : (result.message.createdAt || new Date().toISOString());
            
          return [...prev, {
            id: result.message.id,
            content: result.message.content,
            userId: currentUserId,
            userName: "You",
            userRole: "AGENT", 
            createdAt,
            rewardPoints: result.message.rewardPoints,
            attachmentUrl: result.message.attachmentUrl,
            attachmentType: result.message.attachmentType
          }];
        });
      }
    } catch (e) {
      console.error("Send error:", e);
    } finally {
      setIsSending(false);
    }
  };

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max size is 10MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadChatAsset(formData);
      if (res.success && res.url) {
        await handleSend(res.url, res.type);
      } else {
        alert("Upload failed: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed due to network error.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAction = async (msgId: string, action: 'spam' | 'helpful' | 'like' | 'delete') => {
    setContextMenu(null);
    const { reportSpam, markHelpful, reactToMessage } = await import("@/app/actions/chat");
    
    if (action === 'spam') await reportSpam(msgId);
    else if (action === 'helpful') await markHelpful(msgId);
    else if (action === 'like') await reactToMessage(msgId, 'like');
    else if (action === 'delete') {
      if (confirm("Permanently delete this message?")) {
        await deleteChatMessage(msgId);
      } else return;
    }
    
    // Refresh messages
    const res = await fetch("/api/chat/sync");
    if (res.ok) {
      const data = await res.json();
      setMessages(data.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-surface-container border border-outline-variant/20 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3),inset_0_0_80px_rgba(129,236,255,0.02)] relative h-full">
      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-2 space-y-2 no-scrollbar scroll-smooth"
      >
        {messages.map((msg) => {
          const isSelf = msg.userId === currentUserId;
          return (
            <div key={msg.id} className={cn(
              "flex gap-3 max-w-[90%] animate-vapor",
              isSelf ? "flex-row-reverse ml-auto" : "flex-row"
            )}>
              <div className="shrink-0 relative h-fit">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary font-bold border border-primary/10 ring-2 ring-outline-variant/5 uppercase text-xs">
                  {msg.userName?.[0]}
                </div>
                <div className={cn(
                  "absolute -bottom-1 px-1.5 rounded-sm text-[8px] font-black uppercase tracking-tighter",
                  isSelf ? "bg-primary text-background left-0" : "bg-tertiary right-0 text-white"
                )}>
                  {msg.userRole}
                </div>
              </div>
              <div className={cn("space-y-1", isSelf ? "text-right" : "text-left")}>
                <div className={cn("flex items-center gap-3", isSelf ? "justify-end" : "justify-start")}>
                  {!isSelf && <span className="text-sm font-black text-on-surface uppercase tracking-tight">{msg.userName}</span>}
                  <span className="text-[10px] font-black text-on-surface-variant opacity-40">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isSelf && <span className="text-sm font-black text-primary uppercase tracking-tight">You</span>}
                </div>
                  <div className="relative group/context">
                    <div className={cn(
                      "p-2 px-3 rounded-xl relative group border transition-all backdrop-blur-md shadow-md hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] cursor-context-menu w-fit max-w-[300px] sm:max-w-md",
                      msg.isSpam && "opacity-40 grayscale",
                      msg.isHelpful && "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
                      isSelf 
                        ? "bg-primary/20 border-primary/30 shadow-[0_10px_30px_rgba(129,236,255,0.15)] rounded-tr-none text-on-surface ml-auto" 
                        : "bg-surface-container-high/60 border-outline-variant/10 shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-tl-none text-on-surface-variant/90 mr-auto"
                    )}
                    onContextMenu={(e) => e.preventDefault()}
                    onClick={(e) => {
                      setContextMenu(contextMenu?.msgId === msg.id ? null : { msgId: msg.id });
                    }}
                    >
                      
                      {msg.attachmentUrl && (
                        <div className="rounded-lg overflow-hidden border border-outline-variant/10 bg-surface-container-lowest/20 mb-2 max-w-full">
                          {msg.attachmentType?.startsWith('image/') ? (
                            <img 
                              src={msg.attachmentUrl} 
                              alt="Attachment" 
                              className="max-h-60 w-auto object-contain cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(msg.attachmentUrl as string, '_blank');
                              }}
                            />
                          ) : (
                            <a 
                              href={msg.attachmentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 text-[10px] uppercase font-bold text-primary hover:text-primary/80 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Paperclip size={14} /> View Attachment
                            </a>
                          )}
                        </div>
                      )}
                      
                      <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                      
                      {/* Reactions & Marks Display */}
                      {(msg.reactions && msg.reactions.length > 0 || msg.isHelpful || msg.isSpam) && (
                        <div className={cn("flex flex-wrap gap-1 mt-3", isSelf ? "justify-end" : "justify-start")}>
                          {msg.isHelpful && (
                            <div className="bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-full text-[10px] flex items-center gap-1 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                              <Star size={10} fill="currentColor" />
                              <span className="font-bold uppercase tracking-tighter">Helpful Node</span>
                            </div>
                          )}
                          {msg.isSpam && (
                            <div className="bg-red-500/10 border border-red-500/30 px-2 py-1 rounded-full text-[10px] flex items-center gap-1 text-red-500">
                              <AlertTriangle size={10} />
                              <span className="font-bold uppercase tracking-tighter">Spam</span>
                            </div>
                          )}
                          {msg.reactions && Array.from(new Set(msg.reactions.map(r => r.type))).map(type => (
                            <div key={type} className="bg-surface-container-highest/30 border border-outline-variant/10 px-2 py-1 rounded-full text-[10px] flex items-center gap-1">
                              {type === 'like' && <Heart size={10} fill="#ff4b4b" className="text-[#ff4b4b]" />}
                              <span className="font-bold">{msg.reactions?.filter(r => r.type === type).length}</span>
                            </div>
                          ))}
                        </div>
                      )}
  
                      {msg.rewardPoints > 0 && (
                        <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                           <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-2 py-1 rounded-full border border-emerald-500/30 shadow-lg">+{msg.rewardPoints} PTS</span>
                        </div>
                      )}
                      {isSelf && <div className="flex justify-end mt-2"><CheckCheck size={14} className="text-primary opacity-60" /></div>}
                    </div>

                    {/* Local Context Menu */}
                    {contextMenu?.msgId === msg.id && (
                      <div 
                        className={cn(
                          "absolute z-[120] bg-surface-container border border-outline-variant/20 rounded-2xl shadow-2xl p-2 min-w-[190px] animate-in fade-in zoom-in duration-200 context-menu-container top-1/2 -translate-y-1/2",
                          isSelf ? "right-full mr-4" : "left-full ml-4"
                        )}
                      >
                        <button onClick={() => handleAction(msg.id, 'like')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high/50 text-xs font-bold text-on-surface transition-colors">
                          <Heart size={14} className="text-red-500" /> Like Message
                        </button>
                        <button onClick={() => handleAction(msg.id, 'helpful')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high/50 text-xs font-bold text-on-surface transition-colors">
                          <Star size={14} className="text-amber-500" /> Mark as Helpful
                        </button>
                        <div className="h-[1px] bg-outline-variant/10 my-1" />
                        <button onClick={() => handleAction(msg.id, 'spam')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-xs font-bold text-red-500 transition-colors">
                          <AlertTriangle size={14} /> Report as Spam
                        </button>
                        {(userRole === 'ADMIN' || userRole === 'CSR') && (
                          <>
                            <div className="h-[1px] bg-outline-variant/10 my-1" />
                            <button onClick={() => handleAction(msg.id, 'delete')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600 text-white text-xs font-bold transition-colors">
                              <Trash2 size={14} /> Delete Transmission
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
              </div>
            </div>
          );
        })}
      </div>


      {/* Input Area */}
      <div className="p-4 bg-gradient-to-t from-background/40 to-transparent border-t border-outline-variant/10 relative z-10 backdrop-blur-sm">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="bg-surface-container-high/60 border border-outline-variant/10 p-3 rounded-3xl flex items-center gap-3 focus-within:border-primary/40 focus-within:bg-surface-container-high/90 focus-within:shadow-[0_10px_40px_rgba(129,236,255,0.15)] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.1),inset_0_2px_15px_rgba(255,255,255,0.05)] group backdrop-blur-lg"
        >
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              onChange={onFileSelect}
              accept="image/*,application/pdf,application/zip,application/x-zip-compressed"
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploading || isSending}
              className="p-3 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-high/50 rounded-2xl disabled:opacity-30"
            >
              {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
            </button>
           <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/30" 
            placeholder="Sync a message to the Nexus..." 
           />
           <div className="flex items-center gap-2 pr-2">
              <div className="relative" ref={emojiPickerRef}>
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-4 z-50">
                    <EmojiPicker 
                      onEmojiClick={onEmojiClick}
                      theme={document.documentElement.classList.contains('light') ? Theme.LIGHT : Theme.DARK}
                      lazyLoadEmojis={true}
                    />
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                  className={cn(
                    "p-3 transition-colors rounded-2xl hidden md:block",
                    showEmojiPicker ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high/50"
                  )}
                >
                  <Smile size={20} />
                </button>
              </div>
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
