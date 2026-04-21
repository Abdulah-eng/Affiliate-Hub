"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function SafeImage({ src, fallback = "/placeholder-logo.png", className, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
    }
  };

  return (
    <img
      src={imgSrc}
      className={cn(className)}
      onError={handleError}
      {...props}
    />
  );
}
