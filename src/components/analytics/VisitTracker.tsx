"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordVisit } from '@/app/actions/analytics';

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Record visit on path change
    if (pathname) {
      recordVisit(pathname);
    }
  }, [pathname]);

  return null; // Invisible component
}
