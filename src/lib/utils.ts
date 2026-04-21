import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageSrc(src: string | null | undefined) {
  if (!src) return '/placeholder-logo.png';
  if (src.startsWith('http')) return src;
  
  // Prepend domain for internal uploads to ensure absolute resolution across all environments
  if (src.startsWith('/uploads') || src.startsWith('/api/uploads')) {
    return `https://affiliatehubph.com${src}`;
  }
  
  if (src.startsWith('/')) return src; // Other local assets
  return src;
}
