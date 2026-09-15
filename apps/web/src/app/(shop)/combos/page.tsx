"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Combo } from "@/lib/types";
import { ComboCard } from "@/components/combo-card";
import { ComboCardSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ combos: Combo[] }>("/api/combos").then((d) => setCombos(d.combos)).finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-ink">Combo Deals</h1>
      <p className="mt-1 text-sm text-ink/60">More food, better value — bundled just for you.</p>

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <ComboCardSkeleton key={i} />)}
        </div>
      ) : combos.length === 0 ? (
        <EmptyState icon={<Sparkles className="h-7 w-7" />} title="No combo deals right now" description="Check back soon, or browse our full menu instead." action={{ label: "Browse menu", href: "/menu" }} className="mt-6" />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {combos.map((combo) => <ComboCard key={combo.id} combo={combo} />)}
        </div>
      )}
    </main>
  );
}
