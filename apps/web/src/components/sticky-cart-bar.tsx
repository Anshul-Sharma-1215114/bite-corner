"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatInr } from "@/lib/format";
import { ButtonLink } from "./ui/button";

export function StickyCartBar() {
  const { itemCount, itemsTotal } = useCart();
  if (itemCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 animate-scaleIn px-3 pb-3 sm:hidden">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-red-500 px-4 py-3 text-white shadow-lifted">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span key={itemCount} className="inline-flex animate-scaleIn">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          </span>
          {itemCount} item{itemCount > 1 ? "s" : ""} · {formatInr(itemsTotal)}
        </div>
        <ButtonLink href="/cart" variant="secondary" size="sm">
          View cart
        </ButtonLink>
      </div>
    </div>
  );
}
