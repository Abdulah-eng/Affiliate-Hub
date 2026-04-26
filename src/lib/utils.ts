import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageSrc(src: string | null | undefined) {
  if (!src) return '/placeholder-logo.png';
  
  let path = src;

  // Cloudinary Resilience: Strip versioning (v123456789) as it often causes 404s if outdated
  if (path.includes('cloudinary.com') && path.includes('/image/upload/v')) {
    path = path.replace(/\/v\d+\//, '/');
  }
  
  // Normalize internal URLs: if they contain our domain, make them relative
  const domain = 'https://affiliatehubph.com';
  if (path.startsWith(domain)) {
    path = path.replace(domain, '');
  }
  
  // If it's still an absolute external URL return it as is
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  
  // Ensure leading slash
  if (!path.startsWith('/')) path = '/' + path;
  
  // Convert /uploads paths to /api/uploads
  if (path.startsWith('/uploads') && !path.startsWith('/api/uploads')) {
    path = '/api' + path;
  }
  
  return path;
}
