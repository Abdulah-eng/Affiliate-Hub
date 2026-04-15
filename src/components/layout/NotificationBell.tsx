"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Bell, Check, Info, AlertTriangle, ShieldCheck, X } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead } from "@/app/actions/notifications";
import { cn } from "@/lib/utils";

type NotificationProps = {
  userId: string;
};

export function NotificationBell({ userId }: NotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const data = await getNotifications(userId);
    setNotifications(data);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30 sec polling
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Sound Notification Effect
  const [lastCount, setLastCount] = useState(notifications.length);
  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    if (unread > lastCount) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.warn("Audio play blocked by browser:", e));
    }
    setLastCount(unread);
  }, [notifications]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic UI
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllAsRead(userId);
  };

  const IconForType = (type: string) => {
    switch (type) {
      case "SUCCESS": return <ShieldCheck size={16} className="text-emerald-400" />;
      case "ERROR": return <AlertTriangle size={16} className="text-red-400" />;
      case "WARNING": return <AlertTriangle size={16} className="text-amber-400" />;
      default: return <Info size={16} className="text-primary" />;
    }
  };

  const BgForType = (type: string) => {
    switch (type) {
      case "SUCCESS": return "bg-emerald-500/10 border-emerald-500/20";
      case "ERROR": return "bg-red-500/10 border-red-500/20";
      case "WARNING": return "bg-amber-500/10 border-amber-500/20";
      default: return "bg-primary/10 border-primary/20";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors relative group"
      >
        <Bell size={20} className={cn("transition-transform", unreadCount > 0 ? "group-hover:rotate-12 text-on-surface" : "")} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_#81ecff] animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-[-60px] sm:right-0 mt-4 w-[320px] sm:w-[380px] bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div>
              <h3 className="text-sm font-black font-headline text-on-surface uppercase tracking-tight">System Alerts</h3>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">
                {unreadCount} unread nodes
              </p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[9px] font-black uppercase text-primary tracking-widest px-3 py-1.5 border border-primary/20 rounded-full hover:bg-primary/10 transition-colors"
              >
                Mark All Read
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-on-surface-variant/50">
                <Bell size={32} className="mb-3 opacity-20" />
                <p className="text-[10px] uppercase font-black tracking-widest">Vault is silent</p>
                <p className="text-[10px] opacity-60 mt-1">No alerts at this time.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={cn(
                      "p-4 border-b border-white/5 relative group transition-colors",
                      !n.isRead ? "bg-white/[0.04] hover:bg-white/[0.08]" : "opacity-70 hover:opacity-100 hover:bg-white/5"
                    )}
                  >
                    {!n.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(129,236,255,0.5)]"></div>
                    )}
                    <div className="flex gap-4">
                      <div className={cn("w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border", BgForType(n.type))}>
                        {IconForType(n.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <p className={cn("text-xs font-black uppercase tracking-tight", !n.isRead ? "text-on-surface" : "text-on-surface-variant")}>
                          {n.title}
                        </p>
                        <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed font-medium">
                          {n.message}
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 mt-2">
                          {new Date(n.createdAt).toLocaleString(undefined, { 
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    {!n.isRead && (
                      <button 
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        className="absolute right-4 top-4 p-2 rounded-full text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-white/5 bg-slate-950 flex justify-center">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant hover:text-on-surface p-2 transition-colors flex items-center gap-1"
            >
              <X size={12} /> Close Feed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
