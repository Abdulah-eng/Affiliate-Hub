"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Bell, Search, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatHeaderDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { label: "Notification Settings", icon: <Bell size={14} />, action: () => alert("Notifications toggled") },
    { label: "Search Messages", icon: <Search size={14} />, action: () => alert("Search coming soon") },
    { label: "Clear Sync Cache", icon: <Trash2 size={14} />, action: () => {
        if(confirm("Clear local sync cache? This will not delete messages from the server.")) {
            window.location.reload();
        }
    }},
    { label: "Export Chat Log", icon: <Download size={14} />, action: () => alert("Exporting log...") },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-3 transition-colors rounded-xl",
          isOpen ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
        )}
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in zoom-in duration-200">
          <div className="px-3 py-2 border-b border-white/5 mb-1">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Channel Options</span>
          </div>
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                opt.action();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-xs font-bold text-on-surface transition-colors text-left"
            >
              <span className="text-on-surface-variant">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
          <div className="mt-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-[9px] font-bold text-primary uppercase tracking-tight text-center">Nexus v2.4.0 High-Priority Sync</p>
          </div>
        </div>
      )}
    </div>
  );
}
