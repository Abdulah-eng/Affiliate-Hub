"use client";

import React from "react";

export function ClientSoon({ 
  children, 
  message, 
  className,
  as: Component = "button"
}: { 
  children: React.ReactNode, 
  message: string,
  className?: string,
  as?: "button" | "div"
}) {
  return (
    <Component onClick={() => alert(message)} className={className}>
      {children}
    </Component>
  );
}
