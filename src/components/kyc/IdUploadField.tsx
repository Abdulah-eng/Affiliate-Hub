"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, Eye, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdUploadFieldProps {
  label: string;
  side: "FRONT" | "BACK" | "SELFIE";
  onFileSelect: (file: File | null) => void;
  className?: string;
  required?: boolean;
}

export function IdUploadField({
  label,
  side,
  onFileSelect,
  className,
  required = false
}: IdUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      onFileSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold font-headline text-primary uppercase tracking-[0.2em]">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {preview && (
          <button
            onClick={clearFile}
            className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 uppercase tracking-wider"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl overflow-hidden transition-all cursor-pointer group",
          preview 
            ? "border-primary/50 bg-primary/5 aspect-[4/3]" 
            : "border-outline-variant bg-surface-container-low/50 hover:bg-surface-container-high hover:border-primary/50 py-12"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,.pdf"
          onChange={handleFileChange}
        />

        {preview ? (
          <div className="absolute inset-0 w-full h-full">
            <img
              src={preview}
              alt={label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <Eye size={20} />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <ImageIcon size={20} />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
              <p className="text-[10px] font-bold text-white uppercase tracking-widest text-center truncate">
                {side} Image Loaded
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 transition-transform group-hover:scale-110">
              <UploadCloud size={32} />
            </div>
            <p className="text-sm font-bold text-on-surface mb-2">
              Upload {label}
            </p>
            <p className="text-xs text-on-surface-variant max-w-[200px] leading-relaxed">
              Drag and drop or click to browse. Supports PNG, JPG, or PDF.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
