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
  Trash2,
  Zap
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
  userRole: string;
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
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };

    // Initial mount scroll
    if (messages.length === initialMessages.length) {
      setTimeout(scrollToBottom, 100);
    } else {
      scrollToBottom();
    }
    
    if (messages.length > lastMessageCount.current) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.userId !== currentUserId) {
         playNotification();
      }
    }
    lastMessageCount.current = messages.length;
  }, [messages, currentUserId, playNotification, initialMessages.length]);

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
    const syncRes = await fetch("/api/chat/sync");
    if (syncRes.ok) {
      const data = await syncRes.json();
      setMessages(data.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
    }
  };

  const handleDelete = async (msgId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    setContextMenu(null);
    const res = await deleteChatMessage(msgId);
    if (res.success) {
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } else {
      alert("Delete failed: " + res.error);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-surface-container/30 border border-white/5 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative h-full rounded-3xl">
      {/* Pulse Style Header */}
      <div className="px-6 py-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(129,236,255,0.1)]">
            <Zap fill="currentColor" size={20} />
          </div>
          <div>
            <h2 className="text-xs font-black font-headline text-on-surface uppercase tracking-widest leading-tight">Nexus synchronization active</h2>
            <p className="text-[9px] text-on-surface-variant font-black flex items-center gap-1.5 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Broadcasting to all nodes
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar scroll-smooth bg-slate-950/20"
      >
        {messages.map((msg) => {
          const isSelf = msg.userId === currentUserId;
          return (
            <div key={msg.id} 
              className={cn(
                "flex flex-col max-w-[75%] animate-vapor relative group",
                isSelf ? "ml-auto items-end" : "mr-auto items-start",
                contextMenu?.msgId === msg.id ? "z-[100]" : "z-10"
              )}
            >
              <div className={cn(
                "px-3.5 py-1.5 rounded-2xl text-sm flex flex-col gap-1.5 shadow-xl transition-all hover:scale-[1.01]",
                isSelf 
                  ? "bg-primary text-slate-950 font-bold rounded-tr-none shadow-primary/10" 
                  : "bg-surface-container-high border border-outline-variant/10 text-on-surface rounded-tl-none font-medium"
              )}
              onContextMenu={(e) => e.preventDefault()}
              onClick={(e) => {
                setContextMenu(contextMenu?.msgId === msg.id ? null : { msgId: msg.id });
              }}
              >
                {!isSelf && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{msg.userName}</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-sm bg-tertiary/20 text-tertiary font-black uppercase">
                      {msg.userRole}
                    </span>
                  </div>
                )}

                {msg.attachmentUrl && (
                  <div className="rounded-lg overflow-hidden border border-black/10 bg-black/5 mb-1 max-w-full">
                    {msg.attachmentType?.startsWith('image/') ? (
                      <img 
                        src={msg.attachmentUrl} 
                        alt="Attachment" 
                        className="max-h-60 w-auto object-contain cursor-pointer hover:brightness-110 active:scale-95 transition-all"
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
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-[10px] uppercase font-black tracking-widest",
                          isSelf ? "text-slate-950" : "text-primary"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Paperclip size={14} /> View Secure Asset
                      </a>
                    )}
                  </div>
                )}
                
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                
                {/* Reactions & Marks Display */}
                {(msg.reactions && msg.reactions.length > 0 || msg.isHelpful || msg.isSpam) && (
                  <div className={cn("flex flex-wrap gap-1 mt-2", isSelf ? "justify-end" : "justify-start")}>
                    {msg.isHelpful && (
                      <div className="bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full text-[8px] flex items-center gap-1 text-amber-600">
                        <Star size={8} fill="currentColor" />
                        <span className="font-black uppercase tracking-tighter">Helpful</span>
                      </div>
                    )}
                    {msg.reactions && Array.from(new Set(msg.reactions.map(r => r.type))).map(type => (
                      <div key={type} className="bg-black/10 border border-black/5 px-2 py-0.5 rounded-full text-[8px] flex items-center gap-1">
                        {type === 'like' && <Heart size={8} fill={isSelf ? "#000" : "#ff4b4b"} />}
                        <span className="font-black">{msg.reactions?.filter(r => r.type === type).length}</span>
                      </div>
                    ))}
                  </div>
                )}

                {isSelf && <div className="flex justify-end mt-1"><CheckCheck size={12} className="opacity-40" /></div>}
              </div>

              <span className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-30 px-2">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              {/* Local Context Menu */}
              {contextMenu?.msgId === msg.id && (
                <div 
                  className={cn(
                    "absolute z-[120] bg-surface-container border border-outline-variant/20 rounded-2xl shadow-2xl p-2 min-w-[190px] animate-in fade-in zoom-in duration-200 context-menu-container top-1/2 -translate-y-1/2",
                    isSelf ? "right-full mr-4" : "left-full ml-4"
                  )}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAction(msg.id, 'like'); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high/50 text-xs font-bold text-on-surface transition-colors cursor-pointer"
                  >
                    <Heart size={14} className="text-red-500" /> Like Message
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAction(msg.id, 'helpful'); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high/50 text-xs font-bold text-on-surface transition-colors cursor-pointer"
                  >
                    <Star size={14} className="text-amber-500" /> Mark as Helpful
                  </button>
                  <div className="h-[1px] bg-outline-variant/10 my-1" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAction(msg.id, 'spam'); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-xs font-bold text-red-500 transition-colors cursor-pointer"
                  >
                    <AlertTriangle size={14} /> Report as Spam
                  </button>
                  {(userRole === 'ADMIN' || userRole === 'CSR') && (
                    <>
                      <div className="h-[1px] bg-outline-variant/10 my-1" />
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAction(msg.id, 'delete');
                        }} 
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} /> Delete Transmission
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Area - Pulse Tactical Style */}
      <div className="p-4 bg-slate-950/40 border-t border-white/5 relative z-10 backdrop-blur-md">
        <div className="flex gap-3 items-end max-w-5xl mx-auto w-full">
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
            className="p-3 bg-white/5 border border-white/10 rounded-xl text-on-surface-variant hover:text-primary transition-all active:scale-90 disabled:opacity-30"
          >
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
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
              disabled={isSending}
              placeholder="Relay tactical directive to the Nexus..." 
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 pr-16 text-sm outline-none focus:border-primary transition-all font-medium h-14 custom-scrollbar resize-none placeholder:text-on-surface-variant/30 text-on-surface"
            />
            
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              <div className="relative" ref={emojiPickerRef}>
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-4 z-50">
                    <EmojiPicker 
                      onEmojiClick={onEmojiClick}
                      theme={Theme.DARK}
                      lazyLoadEmojis={true}
                    />
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                  className={cn(
                    "p-2 transition-colors rounded-lg",
                    showEmojiPicker ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary"
                  )}
                >
                  <Smile size={20} />
                </button>
              </div>

              <button 
                type="button" 
                onClick={() => handleSend()}
                disabled={isSending || !input.trim()}
                className="p-3 bg-primary text-slate-950 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-primary/20"
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
