"use client";

import { useEffect, useRef, useState } from "react";

function parseNumber(val: string): { num: number; suffix: string; prefix: string } {
  // e.g. "100+" -> num=100, suffix="+"
  // e.g. "5,000+" -> num=5000, suffix="+"
  // e.g. "95%" -> num=95, suffix="%"
  const clean = val.replace(/,/g, "");
  const prefix = clean.match(/^[^0-9]*/)?.[0] || "";
  const suffix = clean.match(/[^0-9]*$/)?.[0] || "";
  const num = parseFloat(clean.replace(/[^0-9.]/g, "")) || 0;
  return { num, suffix, prefix };
}

function formatNumber(val: number, originalVal: string): string {
  // Preserve comma formatting if original had commas
  if (originalVal.includes(",")) {
    return val.toLocaleString();
  }
  return Math.round(val).toString();
}

function AnimatedNumber({ value, label }: { value: string; label: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const { num, suffix, prefix } = parseNumber(value);
          const duration = 2000;
          const steps = 60;
          const increment = num / steps;
          let current = 0;
          let step = 0;

          const timer = setInterval(() => {
            step++;
            current = Math.min(current + increment, num);
            // Ease out: slow down near the end
            const eased = num * (1 - Math.pow(1 - step / steps, 3));
            const displayVal = Math.min(Math.round(eased), num);
            setDisplay(prefix + formatNumber(displayVal, value) + suffix);

            if (step >= steps) {
              clearInterval(timer);
              setDisplay(value); // Ensure exact final value
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="p-8 text-center space-y-2">
      <h4 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tabular-nums">
        {display}
      </h4>
      <p className="text-on-surface-variant font-medium tracking-wide uppercase text-sm">{label}</p>
    </div>
  );
}

export function AnimatedStats({
  statVal1, statLbl1,
  statVal2, statLbl2,
  statVal3, statLbl3,
}: {
  statVal1: string; statLbl1: string;
  statVal2: string; statLbl2: string;
  statVal3: string; statLbl3: string;
}) {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <AnimatedNumber value={statVal1} label={statLbl1} />
      <div className="border-x border-outline-variant/10">
        <AnimatedNumber value={statVal2} label={statLbl2} />
      </div>
      <AnimatedNumber value={statVal3} label={statLbl3} />
    </div>
  );
}
