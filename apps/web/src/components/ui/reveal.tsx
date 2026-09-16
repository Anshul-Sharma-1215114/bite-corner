"use client";

import { useInView } from "@/lib/use-in-view";

// Fades + rises a section into place the first time it scrolls into view.
// Purely decorative — wraps children without changing their layout.
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`${inView ? "animate-riseIn" : "opacity-0"} ${className}`}>
      {children}
    </div>
  );
}
