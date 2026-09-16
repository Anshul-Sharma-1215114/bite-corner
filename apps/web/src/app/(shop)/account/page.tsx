"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Receipt, ChevronRight, Heart } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { MenuItem } from "@/lib/types";
import { RoleGuard } from "@/components/role-guard";
import { useAuth } from "@/lib/auth-context";
import { formatInr } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  return (
    <RoleGuard role="CUSTOMER" loginPath="/login">
      <AccountContent />
    </RoleGuard>
  );
}

function AccountContent() {
  const { user, logout } = useAuth();
  const [favorites, setFavorites] = useState<{ menuItem: MenuItem }[]>([]);

  useEffect(() => {
    apiFetch<{ favorites: { menuItem: MenuItem }[] }>("/api/favorites").then((d) => setFavorites(d.favorites));
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-display text-xl font-bold">My account</h1>
      <Card className="mt-3">
        <p className="font-semibold">{user?.name}</p>
        <p className="text-sm text-ink/50">{user?.phone}</p>
      </Card>

      <div className="mt-4 flex flex-col gap-2">
        <Link href="/account/addresses" className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-4 py-3 shadow-soft transition hover:bg-red-50">
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-red-500" aria-hidden="true" /> Saved addresses</span>
          <ChevronRight className="h-4 w-4 text-ink/30" aria-hidden="true" />
        </Link>
        <Link href="/orders" className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-4 py-3 shadow-soft transition hover:bg-red-50">
          <span className="flex items-center gap-2"><Receipt className="h-4 w-4 text-red-500" aria-hidden="true" /> Order history</span>
          <ChevronRight className="h-4 w-4 text-ink/30" aria-hidden="true" />
        </Link>
      </div>

      <h2 className="mt-6 mb-2 font-semibold">Favorites</h2>
      {favorites.length === 0 ? (
        <p className="flex items-center gap-1.5 text-sm text-ink/50"><Heart className="h-3.5 w-3.5" aria-hidden="true" /> Tap the heart on any item to save it here.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {favorites.map((f) => (
            <Link key={f.menuItem.id} href={`/menu/${f.menuItem.id}`}>
              <Card interactive className="flex items-center justify-between">
                <span>{f.menuItem.name}</span>
                <span className="text-sm font-medium text-red-600">{formatInr(f.menuItem.price)}</span>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Button variant="ghost" size="sm" onClick={logout} className="mt-8">Log out</Button>
    </main>
  );
}
