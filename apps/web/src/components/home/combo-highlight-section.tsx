"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Combo } from "@/lib/types";
import { formatInr } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { ComboCardSkeleton } from "@/components/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

function ComboHighlightCard({ combo }: { combo: Combo }) {
  const { addLine } = useCart();
  const [added, setAdded] = useState(false);

  function orderThisMeal() {
    addLine({
      kind: "combo",
      refId: combo.id,
      name: combo.name,
      price: Number(combo.price),
      imageUrl: combo.imageUrl,
      isVeg: combo.items.every((ci) => ci.menuItem.isVeg),
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Card tone="yellow" padded={false} interactive className="flex flex-col overflow-hidden !rounded-3xl">
      <div className="bg-red-500 px-5 py-2 text-xs font-bold uppercase tracking-wide text-white">Combo Deal</div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-ink">{combo.name}</h3>
        {combo.description && <p className="mt-1 text-sm text-ink/60">{combo.description}</p>}
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="font-display text-xl font-bold text-red-600">{formatInr(combo.price)}</span>
          <div className="flex items-center gap-2">
            <Link href={`/combo/${combo.id}`} className="text-xs text-ink/50 underline underline-offset-2">
              Customize
            </Link>
            <Button variant="primary" size="sm" onClick={orderThisMeal}>
              {added && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
              {added ? "Added" : "Order this deal"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ComboHighlightSection() {
  const [combos, setCombos] = useState<Combo[] | null>(null);

  useEffect(() => {
    apiFetch<{ combos: Combo[] }>("/api/combos").then((d) => setCombos(d.combos));
  }, []);

  if (combos?.length === 0) return null;

  return (
    <section className="bg-yellow-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading title="Combo Deals" subtitle="More food, better value — bundled just for you." />
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {combos === null ? Array.from({ length: 3 }).map((_, i) => <ComboCardSkeleton key={i} />) : combos.map((combo) => <ComboHighlightCard key={combo.id} combo={combo} />)}
        </div>
      </div>
    </section>
  );
}
