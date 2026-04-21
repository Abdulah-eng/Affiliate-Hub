"use client";

import React, { useState } from 'react';
import { cn, getImageSrc } from '@/lib/utils';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function SafeImage({ src, fallback = "/placeholder-logo.png", className, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(getImageSrc(src));
  const [hasError, setHasError] = useState(false);

  // Synchronize internal state when src prop changes
  React.useEffect(() => {
    setImgSrc(getImageSrc(src));
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getImageSrc(fallback));
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
