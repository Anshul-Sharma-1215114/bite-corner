"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { MenuItem } from "@/lib/types";
import { ItemCard } from "@/components/item-card";
import { ItemCardSkeleton } from "@/components/skeleton";
import { getSocket } from "@/lib/socket";
import { SectionHeading } from "@/components/ui/section-heading";
import { CarouselArrows } from "@/components/ui/carousel-arrows";

// Ranked by real order volume server-side, not a hardcoded list — falls
// back to newest items until enough order history exists to rank by.
export function PopularItemsSection() {
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: direction * 240, behavior: "smooth" });
  }

  useEffect(() => {
    function load() {
      apiFetch<{ items: MenuItem[] }>("/api/menu-items/popular").then((d) => setItems(d.items));
    }
    load();
    const socket = getSocket();
    socket.on("menu:item-updated", load);
    return () => {
      socket.off("menu:item-updated", load);
    };
  }, []);

  if (items?.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <SectionHeading title="Crowd Favorites" subtitle="What everyone's ordering right now." />
        <CarouselArrows variant="dark" onPrev={() => scrollByCard(-1)} onNext={() => scrollByCard(1)} className="hidden shrink-0 sm:flex" />
      </div>
      <div ref={scrollerRef} className="mt-5 flex gap-4 overflow-x-auto pb-2 scroll-smooth">
        {items === null
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-48 shrink-0 sm:w-56">
                <ItemCardSkeleton />
              </div>
            ))
          : items.map((item) => (
              <div key={item.id} className="w-48 shrink-0 sm:w-56">
                <ItemCard item={item} showBestsellerBadge />
              </div>
            ))}
      </div>
    </section>
  );
}
