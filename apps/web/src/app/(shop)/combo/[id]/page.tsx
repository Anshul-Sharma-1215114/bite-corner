"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Sparkles, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Combo, MenuItem } from "@/lib/types";
import { formatInr } from "@/lib/format";
import { useCart, type CartSwap } from "@/lib/cart-context";
import { VegBadge } from "@/components/veg-badge";
import { DetailPageSkeleton } from "@/components/skeleton";
import { resolveImageUrl } from "@/lib/api-url";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ComboDetailResponse {
  combo: Combo;
  substitutionOptions: Record<string, MenuItem[]>;
}

export default function ComboDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addLine } = useCart();
  const [data, setData] = useState<ComboDetailResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  useEffect(() => {
    apiFetch<ComboDetailResponse>(`/api/combos/${id}`)
      .then((d) => {
        setData(d);
        setSelections(Object.fromEntries(d.combo.items.map((ci) => [ci.id, ci.menuItemId])));
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return <p className="p-6 text-center text-ink/60">Combo not found.</p>;
  if (!data) return <DetailPageSkeleton />;

  const { combo, substitutionOptions } = data;
  const imageUrl = resolveImageUrl(combo.imageUrl);

  function handleAddToCart() {
    const swaps: CartSwap[] = [];
    for (const comboItem of combo.items) {
      const chosenId = selections[comboItem.id];
      if (chosenId !== comboItem.menuItemId) {
        const chosenItem = substitutionOptions[comboItem.id]?.find((c) => c.id === chosenId);
        if (chosenItem) {
          swaps.push({ comboItemId: comboItem.id, toMenuItemId: chosenItem.id, fromName: comboItem.menuItem.name, toName: chosenItem.name });
        }
      }
    }
    addLine({
      kind: "combo",
      refId: combo.id,
      name: combo.name,
      price: Number(combo.price),
      imageUrl: combo.imageUrl,
      isVeg: combo.items.every((ci) => ci.menuItem.isVeg),
      quantity: 1,
      swaps: swaps.length > 0 ? swaps : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="relative">
          <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[3rem] bg-red-50 sm:-inset-8" />
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-yellow-50 shadow-card sm:aspect-[4/5]">
            {imageUrl ? (
              <Image src={imageUrl} alt={combo.name} fill sizes="(max-width: 672px) 100vw, 50vw" priority className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-yellow-500">
                <Sparkles className="h-16 w-16" />
              </div>
            )}
          </div>
        </div>

        <div>
          <span className="inline-block rounded-2xl rounded-bl-none bg-yellow-400 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-ink">
            Combo Deal
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold sm:text-3xl">{combo.name}</h1>
          {combo.description && <p className="mt-2 text-ink/70">{combo.description}</p>}

          <div className="mt-6 space-y-3">
            <h2 className="font-bold text-ink/80">What&apos;s included</h2>
            {combo.items.map((comboItem) => {
              const options = substitutionOptions[comboItem.id];
              return (
                <Card key={comboItem.id} padded={false} className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink/60">Qty {comboItem.quantity}</span>
                    {comboItem.swappable && <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">Swappable</span>}
                  </div>
                  {comboItem.swappable && options?.length ? (
                    <select
                      value={selections[comboItem.id]}
                      onChange={(e) => setSelections((prev) => ({ ...prev, [comboItem.id]: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
                    >
                      <option value={comboItem.menuItemId}>{comboItem.menuItem.name} (default)</option>
                      {options.map((opt) => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </select>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <VegBadge isVeg={comboItem.menuItem.isVeg} />
                      <span className="font-medium">{comboItem.menuItem.name}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <Card tone="yellow" className="mt-6 flex items-center justify-between">
            <span className="text-2xl font-extrabold text-red-600">{formatInr(combo.price)}</span>
            <Button size="lg" onClick={handleAddToCart}>
              {added && <Check className="h-4 w-4" aria-hidden="true" />}
              {added ? "Added!" : "Add to cart"}
            </Button>
          </Card>
        </div>
      </div>
    </main>
  );
}
