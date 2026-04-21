import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageSrc(src: string | null | undefined) {
  if (!src) return '/placeholder-logo.png';
  
  let path = src;
  
  // Normalize internal URLs: if they contain our domain, make them relative
  // This prevents issues with SSL/DNS when the server tries to resolve its own public domain
  const domain = 'https://affiliatehubph.com';
  if (path.startsWith(domain)) {
    path = path.replace(domain, '');
  }
  
  // If it's still an absolute external URL (e.g. Google Photos), return it as is
  if (path.startsWith('http')) return path;
  
  // Ensure leading slash
  if (!path.startsWith('/')) path = '/' + path;

  // Convert /uploads paths to /api/uploads for dynamic serving
  // This is critical for Next.js standalone mode (Docker) where public/ is static
  if (path.startsWith('/uploads') && !path.startsWith('/api/uploads')) {
    path = '/api' + path;
  }
  
  return path;
}
