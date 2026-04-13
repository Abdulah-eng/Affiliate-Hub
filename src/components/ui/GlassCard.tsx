import React from 'react';
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard = ({ children, className, glow = true, ...props }: GlassCardProps) => {
  return (
    <div 
      {...props}
      className={cn(
        "glass-panel rounded-xl p-4 sm:p-8 group transition-all duration-500",
        glow && "neon-glow-primary hover:shadow-[0_0_40px_rgba(129,236,255,0.2)]",
        className
      )}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
