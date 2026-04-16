import React from 'react';
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  glow?: boolean;
}

export const GlassCard = ({ children, className, innerClassName, glow = true, ...props }: GlassCardProps) => {
  return (
    <div 
      {...props}
      className={cn(
        "glass-panel rounded-xl group transition-all duration-500",
        // Only apply default padding if innerClassName is not provided
        !innerClassName && "p-4 sm:p-8",
        glow && "neon-glow-primary hover:shadow-[0_0_40px_rgba(129,236,255,0.2)]",
        className
      )}
    >
      <div className={cn("relative z-10", innerClassName)}>
        {children}
      </div>
    </div>
  );
};
