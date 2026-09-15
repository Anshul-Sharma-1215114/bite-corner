"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ShopConfigPublic } from "@/lib/types";
import { LogoMark } from "./logo-mark";

export function Footer() {
  const [shopConfig, setShopConfig] = useState<ShopConfigPublic | null>(null);

  useEffect(() => {
    apiFetch<ShopConfigPublic>("/api/shop-config/public").then(setShopConfig);
  }, []);

  return (
    <footer className="mt-16 border-t-4 border-yellow-400 bg-ink text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-lg font-bold">Bite Corner</span>
          </div>
          <p className="mt-2 max-w-xs text-sm text-white/60">Italian &amp; Chinese fast food — hot, fast, and delivered to your door.</p>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold text-yellow-400">Quick links</h3>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-white/70">
            <li><Link href="/menu" className="hover:text-yellow-300">Menu</Link></li>
            <li><Link href="/combos" className="hover:text-yellow-300">Combos</Link></li>
            <li><Link href="/orders" className="hover:text-yellow-300">Track Order</Link></li>
            <li><Link href="/login" className="hover:text-yellow-300">Login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold text-yellow-400">Visit us</h3>
          {shopConfig ? (
            <div className="mt-2 flex flex-col gap-1.5 text-sm text-white/70">
              {shopConfig.address && (
                <p className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-400" aria-hidden="true" />
                  {shopConfig.address}
                </p>
              )}
              <p className="mt-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0 text-yellow-400" aria-hidden="true" />
                Open daily {shopConfig.openTime} – {shopConfig.closeTime}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/40">Loading...</p>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Bite Corner. Hot, fast, and always fresh.
      </div>
    </footer>
  );
}
