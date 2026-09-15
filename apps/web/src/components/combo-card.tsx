"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { Combo } from "@/lib/types";
import { formatInr } from "@/lib/format";
import { resolveImageUrl } from "@/lib/api-url";

export function ComboCard({ combo }: { combo: Combo }) {
  const imageUrl = resolveImageUrl(combo.imageUrl);
  return (
    <Link
      href={`/combo/${combo.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border-2 border-yellow-300 bg-yellow-50 shadow-soft transition hover:-translate-y-1 hover:border-yellow-400 hover:shadow-card"
    >
      <div className="relative aspect-[4/3] bg-yellow-100">
        {imageUrl ? (
          <Image src={imageUrl} alt={combo.name} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-yellow-500">
            <Sparkles className="h-10 w-10" />
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-soft">Combo</span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="font-display font-semibold leading-tight">{combo.name}</span>
        {combo.description && <p className="line-clamp-2 text-sm text-ink/60">{combo.description}</p>}
        <p className="mt-1 text-xs text-ink/50">Includes {combo.items.length} items</p>
        <div className="mt-auto pt-3">
          <span className="text-lg font-bold text-red-600">{formatInr(combo.price)}</span>
        </div>
      </div>
    </Link>
  );
}
