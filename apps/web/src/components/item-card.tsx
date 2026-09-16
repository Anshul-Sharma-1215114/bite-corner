"use client";

import Link from "next/link";
import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { formatInr } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { resolveImageUrl } from "@/lib/api-url";
import { VegBadge } from "./veg-badge";
import { QuantityStepper } from "./quantity-stepper";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

export function ItemCard({ item, showBestsellerBadge = false }: { item: MenuItem; showBestsellerBadge?: boolean }) {
  const { lines, addLine, updateQuantity } = useCart();
  const cartLine = lines.find((l) => l.kind === "item" && l.refId === item.id);
  const quantity = cartLine?.quantity ?? 0;
  const imageUrl = resolveImageUrl(item.imageUrl);

  return (
    <Card tone="default" interactive padded={false} className="group flex flex-col overflow-hidden">
      <Link href={`/menu/${item.id}`} className="relative block aspect-[4/3] overflow-hidden bg-yellow-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-red-200">
            <UtensilsCrossed className="h-10 w-10" />
          </div>
        )}
        {showBestsellerBadge && (
          <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-soft">🔥 Bestseller</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/menu/${item.id}`} className="font-display font-bold leading-tight hover:text-red-600">
            {item.name}
          </Link>
          <VegBadge isVeg={item.isVeg} />
        </div>
        {item.description && <p className="line-clamp-2 text-sm text-ink/60">{item.description}</p>}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="shrink-0 text-base font-bold text-red-600 sm:text-lg">{formatInr(item.price)}</span>
          {quantity > 0 ? (
            <QuantityStepper quantity={quantity} onChange={(next) => updateQuantity(cartLine!.key, next)} />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                addLine({ kind: "item", refId: item.id, name: item.name, price: Number(item.price), imageUrl: item.imageUrl, isVeg: item.isVeg, quantity: 1 })
              }
            >
              Add
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
