"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 480);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className={`fixed bottom-24 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-600 shadow-card ring-1 ring-red-100 transition-all duration-200 hover:scale-105 hover:bg-red-50 active:scale-95 sm:bottom-5 sm:left-5 sm:h-11 sm:w-11 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
    </button>
  );
}
