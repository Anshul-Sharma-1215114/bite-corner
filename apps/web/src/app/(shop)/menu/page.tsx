"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Category, MenuItem } from "@/lib/types";
import { ItemCard } from "@/components/item-card";
import { ItemCardSkeleton } from "@/components/skeleton";
import { getSocket } from "@/lib/socket";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { StickyCartBar } from "@/components/sticky-cart-bar";

type VegFilter = "all" | "veg" | "nonveg";

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [vegFilter, setVegFilter] = useState<VegFilter>("all");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<{ categories: Category[] }>("/api/categories").then((d) => setCategories(d.categories));
  }, []);

  const refetchItems = useCallback(() => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (search.trim()) params.set("search", search.trim());
    if (vegFilter !== "all") params.set("veg", vegFilter === "veg" ? "true" : "false");
    if (maxPrice) params.set("maxPrice", String(maxPrice));

    setLoading(true);
    return apiFetch<{ items: MenuItem[] }>(`/api/menu-items?${params.toString()}`)
      .then((d) => setItems(d.items))
      .finally(() => setLoading(false));
  }, [activeCategory, search, vegFilter, maxPrice]);

  useEffect(() => {
    refetchItems();
  }, [refetchItems]);

  useEffect(() => {
    const socket = getSocket();
    socket.on("menu:item-updated", refetchItems);
    return () => {
      socket.off("menu:item-updated", refetchItems);
    };
  }, [refetchItems]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 font-display text-2xl font-bold text-ink">Our Menu</h1>

      {/* top offset matches <Header>'s measured rendered height (108.5px)
          so this tucks in flush below it instead of leaving a gap items
          scroll through. */}
      <div className="sticky top-[108.5px] z-10 -mx-4 mb-4 flex items-center gap-2 overflow-x-auto bg-white/95 px-4 py-2 backdrop-blur">
        <Chip active={activeCategory === null} onClick={() => setActiveCategory(null)}>All</Chip>
        {categories.map((cat) => (
          <Chip key={cat.id} active={activeCategory === cat.id} onClick={() => setActiveCategory(cat.id)}>{cat.name}</Chip>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search for a dish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border-2 border-ink/10 bg-white py-2 pl-10 pr-4 text-sm shadow-soft focus:border-red-400 focus:outline-none"
          />
        </div>
        <select value={vegFilter} onChange={(e) => setVegFilter(e.target.value as VegFilter)} className="rounded-full border-2 border-ink/10 bg-white px-3 py-2 text-sm shadow-soft">
          <option value="all">Veg &amp; Non-veg</option>
          <option value="veg">Veg only</option>
          <option value="nonveg">Non-veg only</option>
        </select>
        <select value={maxPrice ?? ""} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)} className="rounded-full border-2 border-ink/10 bg-white px-3 py-2 text-sm shadow-soft">
          <option value="">Any price</option>
          <option value="150">Under ₹150</option>
          <option value="250">Under ₹250</option>
          <option value="400">Under ₹400</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <ItemCardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-7 w-7" />}
          title="No items match your filters"
          description="Try a different category or clear your search."
          action={{
            label: "Clear filters",
            onClick: () => {
              setActiveCategory(null);
              setSearch("");
              setVegFilter("all");
              setMaxPrice(null);
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
      <StickyCartBar />
    </main>
  );
}
