"use client";

import { useEffect, useState } from "react";
import { Phone, MessageCircle, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ShopConfigPublic } from "@/lib/types";

const WHATSAPP_MESSAGE = "Hi Bite Corner! I had a question about my order.";

function WhatsAppIcon({ className = "h-5 w-5 sm:h-6 sm:w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="white" aria-hidden="true">
      <path d="M16.04 4c-6.63 0-12 5.37-12 12 0 2.12.56 4.16 1.62 5.96L4 28l6.2-1.63a11.94 11.94 0 0 0 5.84 1.49h.01c6.62 0 12-5.37 12-12s-5.38-12-12.01-12Zm0 21.9h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.68.97.98-3.58-.24-.37a9.9 9.9 0 0 1-1.52-5.33c0-5.47 4.45-9.92 9.92-9.92 2.65 0 5.14 1.03 7.01 2.9a9.85 9.85 0 0 1 2.9 7.02c0 5.47-4.45 9.9-9.95 9.9Zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.24-.46-2.37-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function ContactButtons() {
  const [shopConfig, setShopConfig] = useState<ShopConfigPublic | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    apiFetch<ShopConfigPublic>("/api/shop-config/public").then(setShopConfig).catch(() => {});
  }, []);

  const number = shopConfig?.whatsappNumber;
  if (!number) return null;

  const digitsOnly = number.replace(/\D/g, "");
  const whatsappHref = `https://wa.me/${digitsOnly}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div className="fixed bottom-24 right-4 z-20 flex flex-col items-end gap-2.5 sm:bottom-5 sm:right-5">
      {/* Quick actions — collapsed into the toggle button until tapped, so
          two full-size FABs don't sit on screen (and over content) at all times. */}
      <div className={`flex flex-col items-end gap-2.5 transition-all duration-200 ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Bite Corner on WhatsApp"
          tabIndex={open ? 0 : -1}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] shadow-lifted transition hover:scale-105 active:scale-95 sm:h-12 sm:w-12"
        >
          <WhatsAppIcon />
        </a>
        <a
          href={`tel:${number}`}
          aria-label="Call Bite Corner"
          tabIndex={open ? 0 : -1}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 shadow-lifted transition hover:scale-105 active:scale-95 sm:h-12 sm:w-12"
        >
          <Phone className="h-4 w-4 fill-white text-white sm:h-5 sm:w-5" aria-hidden="true" />
        </a>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close contact options" : "Contact Bite Corner"}
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white shadow-lifted transition hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
      >
        {open ? <X className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" /> : <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />}
      </button>
    </div>
  );
}
