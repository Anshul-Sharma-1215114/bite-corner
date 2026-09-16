"use client";

import { useEffect, useRef, useState } from "react";

// Fires once, the first time the element scrolls into view — used to
// trigger a one-shot "rise in" entrance animation per section/card instead
// of animating on every re-render.
//
// Real content must never depend on this to become visible at all — a
// bounded fallback timer forces it visible regardless, in case a slow
// device, a fast flick-scroll, or any environment that doesn't fire
// IntersectionObserver as expected leaves the observer never triggering.
export function useInView<T extends HTMLElement>(threshold = 0.15, fallbackMs = 1200) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);

    const fallback = setTimeout(() => setInView(true), fallbackMs);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [threshold, fallbackMs]);

  return { ref, inView };
}
