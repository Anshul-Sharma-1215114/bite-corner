"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, UtensilsCrossed } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import type { MenuItem } from "@/lib/types";
import { formatInr } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { VegBadge } from "@/components/veg-badge";
import { QuantityStepper } from "@/components/quantity-stepper";
import { useAuth } from "@/lib/auth-context";
import { getSocket } from "@/lib/socket";
import { DetailPageSkeleton } from "@/components/skeleton";
import { resolveImageUrl } from "@/lib/api-url";
import { IconButton } from "@/components/ui/icon-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MenuItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { lines, addLine, updateQuantity } = useCart();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    apiFetch<{ item: MenuItem }>(`/api/menu-items/${id}`).then((d) => setItem(d.item)).catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    const socket = getSocket();
    function onUpdate(payload: { menuItemId: string }) {
      if (payload.menuItemId === id) apiFetch<{ item: MenuItem }>(`/api/menu-items/${id}`).then((d) => setItem(d.item));
    }
    socket.on("menu:item-updated", onUpdate);
    return () => {
      socket.off("menu:item-updated", onUpdate);
    };
  }, [id]);

  useEffect(() => {
    if (!user) return;
    apiFetch<{ favorites: { menuItemId: string }[] }>("/api/favorites").then((d) => setIsFavorite(d.favorites.some((f) => f.menuItemId === id))).catch(() => {});
  }, [user, id]);

  async function toggleFavorite() {
    if (!user) return router.push("/login");
    try {
      if (isFavorite) await apiFetch(`/api/favorites/${id}`, { method: "DELETE" });
      else await apiFetch(`/api/favorites/${id}`, { method: "POST" });
      setIsFavorite(!isFavorite);
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    }
  }

  if (notFound) return <EmptyStateNotFound />;
  if (!item) return <DetailPageSkeleton />;

  const cartLine = lines.find((l) => l.kind === "item" && l.refId === item.id);
  const quantity = cartLine?.quantity ?? 0;
  const imageUrl = resolveImageUrl(item.imageUrl);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-yellow-50">
        {imageUrl ? (
          <Image src={imageUrl} alt={item.name} fill sizes="(max-width: 672px) 100vw, 672px" priority className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-red-200">
            <UtensilsCrossed className="h-14 w-14" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <VegBadge isVeg={item.isVeg} />
            <h1 className="font-display text-xl font-bold">{item.name}</h1>
          </div>
          {item.category && <p className="text-sm text-ink/50">{item.category.name}</p>}
        </div>
        <IconButton icon={<Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-ink/30"}`} />} label="Toggle favorite" variant="ghost" onClick={toggleFavorite} />
      </div>

      {item.description && <p className="mt-3 text-ink/70">{item.description}</p>}

      <Card className="mt-6 flex items-center justify-between">
        <span className="text-xl font-bold text-red-600">{formatInr(item.price)}</span>
        {!item.available ? (
          <span className="rounded-full bg-ink/10 px-4 py-2 text-sm font-semibold text-ink/50">Currently sold out</span>
        ) : quantity > 0 ? (
          <QuantityStepper quantity={quantity} onChange={(next) => updateQuantity(cartLine!.key, next)} />
        ) : (
          <Button
            onClick={() =>
              addLine({ kind: "item", refId: item.id, name: item.name, price: Number(item.price), imageUrl: item.imageUrl, isVeg: item.isVeg, quantity: 1 })
            }
          >
            Add to cart
          </Button>
        )}
      </Card>
    </main>
  );
}

function EmptyStateNotFound() {
  return <p className="p-6 text-center text-ink/60">Item not found.</p>;
}
