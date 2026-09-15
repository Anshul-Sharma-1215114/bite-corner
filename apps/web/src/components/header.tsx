"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu as MenuIcon, X, Pizza, Soup, Package, User, MapPin, type LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { apiFetch } from "@/lib/api";
import { LogoMark } from "./logo-mark";
import type { Address } from "@/lib/types";

function NavPill({ href, isActive, onClick, className = "", children }: { href: string; isActive: boolean; onClick?: () => void; className?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        isActive ? "bg-red-500 text-white shadow-soft" : "text-ink/70 hover:bg-red-50 hover:text-red-700"
      } ${className}`}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "CUSTOMER") {
      setDefaultAddress(null);
      return;
    }
    apiFetch<{ addresses: Address[] }>("/api/addresses")
      .then((d) => setDefaultAddress(d.addresses.find((a) => a.isDefault) ?? d.addresses[0] ?? null))
      .catch(() => setDefaultAddress(null));
  }, [user]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const accountHref = user ? "/account" : "/login";
  const navItems: { href: string; isActive: boolean; Icon: LucideIcon; label: string }[] = [
    { href: "/menu", isActive: pathname.startsWith("/menu"), Icon: Pizza, label: "Menu" },
    { href: "/combos", isActive: pathname.startsWith("/combo"), Icon: Soup, label: "Combos" },
    { href: "/orders", isActive: pathname.startsWith("/orders"), Icon: Package, label: "Track Order" },
    { href: accountHref, isActive: pathname.startsWith(accountHref), Icon: User, label: user ? user.name.split(" ")[0] : "Login" },
  ];

  return (
    <header className="sticky top-0 z-20 border-b-4 border-yellow-400 bg-white/95 shadow-soft backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <LogoMark className="h-10 w-10 shrink-0" />
          <span className="font-display text-xl font-bold tracking-tight text-ink">Bite Corner</span>
        </Link>

        <nav className="hidden items-center gap-1.5 sm:flex">
          {navItems.map((item) => (
            <NavPill key={item.href} href={item.href} isActive={item.isActive}>
              <item.Icon className="h-4 w-4" aria-hidden="true" /> {item.label}
            </NavPill>
          ))}
          <Link href="/cart" className="relative ml-1 flex shrink-0 items-center gap-1.5 rounded-full bg-red-500 px-4 py-1.5 text-sm font-bold text-white shadow-pop transition hover:bg-red-600">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-ink ring-2 ring-white">{itemCount}</span>
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <Link href="/cart" className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-soft" aria-label="Cart">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-ink ring-2 ring-white">{itemCount}</span>
            )}
          </Link>
          <button onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink transition hover:bg-red-50">
            {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <MenuIcon className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-red-100 bg-white px-4 py-3 sm:hidden">
          {navItems.map((item) => (
            <NavPill key={item.href} href={item.href} isActive={item.isActive} onClick={() => setMenuOpen(false)} className="w-full">
              <item.Icon className="h-4 w-4" aria-hidden="true" /> {item.label}
            </NavPill>
          ))}
        </nav>
      )}

      <div className="flex items-center justify-center gap-1.5 border-t border-yellow-200 bg-yellow-50 px-4 py-1.5 text-center text-xs text-ink/80">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" aria-hidden="true" />
        {!user ? (
          <Link href="/login" className="underline underline-offset-2 hover:text-red-700">Log in to set your delivery address</Link>
        ) : defaultAddress ? (
          <span>
            Delivering to: <span className="font-semibold">{defaultAddress.area}, {defaultAddress.city}</span>{" "}
            <Link href="/account/addresses" className="font-semibold text-red-600 underline underline-offset-2">Change</Link>
          </span>
        ) : (
          <Link href="/account/addresses" className="underline underline-offset-2 hover:text-red-700">Add a delivery address</Link>
        )}
      </div>
    </header>
  );
}
