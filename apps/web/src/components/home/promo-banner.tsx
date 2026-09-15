"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatInr } from "@/lib/format";

interface ActiveCoupon {
  code: string;
  type: "FLAT" | "PERCENT";
  value: string;
  minOrderValue: string;
}

function couponLabel(c: ActiveCoupon): string {
  const discount = c.type === "PERCENT" ? `${Number(c.value)}% OFF` : `${formatInr(c.value)} OFF`;
  return `Use code ${c.code} for ${discount} on orders above ${formatInr(c.minOrderValue)}`;
}

// Driven by real, currently-active coupons (GET /api/coupons/active) — not
// invented offers. Renders nothing if there's nothing real to show.
export function PromoBanner() {
  const [coupons, setCoupons] = useState<ActiveCoupon[]>([]);

  useEffect(() => {
    apiFetch<{ coupons: ActiveCoupon[] }>("/api/coupons/active").then((d) => setCoupons(d.coupons)).catch(() => {});
  }, []);

  if (coupons.length === 0) return null;

  const labels = coupons.map(couponLabel);
  const track = [...labels, ...labels];

  return (
    <div className="overflow-hidden border-y-2 border-yellow-500 bg-yellow-400 py-2">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {track.map((label, i) => (
          <span key={i} className="flex items-center gap-2 text-sm font-bold text-ink">
            <Tag className="h-4 w-4" aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
