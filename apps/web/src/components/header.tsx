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

function NavPill({
  href,
  isActive,
  transparent,
  onClick,
  className = "",
  children,
}: {
  href: string;
  isActive: boolean;
  transparent: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const activeClasses = transparent ? "bg-white text-red-600 shadow-card" : "bg-red-500 text-white shadow-card";
  const inactiveClasses = transparent
    ? "text-white/90 hover:-translate-y-0.5 hover:bg-white/15 hover:text-white"
    : "text-ink/80 hover:-translate-y-0.5 hover:bg-red-100 hover:text-red-700 hover:shadow-soft";
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition-all ${isActive ? activeClasses : inactiveClasses} ${className}`}
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
  const isHome = pathname === "/";
  // Off-home pages have no colorful hero to float over, so they always get
  // the solid header. On home, start transparent and solidify on scroll.
  const [scrolled, setScrolled] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    function onScroll() {
      setScrolled(window.scrollY > 48);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

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

  // Force the solid look while the mobile dropdown is open — a transparent
  // bar above a solid white dropdown reads as broken, not floating.
  const transparent = isHome && !scrolled && !menuOpen;

  const accountHref = user ? "/account" : "/login";
  const navItems: { href: string; isActive: boolean; Icon: LucideIcon; label: string }[] = [
    { href: "/menu", isActive: pathname.startsWith("/menu"), Icon: Pizza, label: "Menu" },
    { href: "/combos", isActive: pathname.startsWith("/combo"), Icon: Soup, label: "Combos" },
    { href: "/orders", isActive: pathname.startsWith("/orders"), Icon: Package, label: "Track Order" },
    { href: accountHref, isActive: pathname.startsWith(accountHref), Icon: User, label: user ? user.name.split(" ")[0] : "Login" },
  ];

  return (
    <header className={`${isHome ? "fixed" : "sticky"} top-0 z-30 w-full transition-shadow duration-300 ${transparent ? "" : "shadow-card"}`}>
      <div
        className={`transition-colors duration-300 ${
          transparent ? "bg-gradient-to-b from-black/45 via-black/10 to-transparent" : "bg-white/95 backdrop-blur"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5">
          <Link href="/" className="group flex shrink-0 items-center gap-3">
            <LogoMark className="h-14 w-14 shrink-0 drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
            <span className={`font-display text-2xl font-extrabold tracking-tight transition-colors duration-300 sm:text-3xl ${transparent ? "text-white" : "text-ink"}`}>
              Bite <span className={transparent ? "text-yellow-300" : "text-red-500"}>Corner</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1.5 sm:flex">
            {navItems.map((item) => (
              <NavPill key={item.href} href={item.href} isActive={item.isActive} transparent={transparent}>
                <item.Icon className={`h-4 w-4 ${item.isActive ? "" : transparent ? "text-yellow-300" : "text-red-500"}`} aria-hidden="true" /> {item.label}
              </NavPill>
            ))}
            <Link
              href="/cart"
              className={`relative ml-1 flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition hover:-translate-y-0.5 ${
                transparent ? "bg-white text-red-600 shadow-lifted hover:bg-yellow-50" : "bg-red-500 text-white shadow-card ring-2 ring-yellow-400/50 hover:bg-red-600 hover:shadow-lifted"
              }`}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Cart
              {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-ink ring-2 ring-white">{itemCount}</span>
                </span>
              )}
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:hidden">
            <Link
              href="/cart"
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                transparent ? "bg-white text-red-600 shadow-lifted" : "bg-red-500 text-white shadow-card ring-2 ring-yellow-400/50 hover:bg-red-600"
              }`}
              aria-label="Cart"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-ink ring-2 ring-white">{itemCount}</span>
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${transparent ? "text-white hover:bg-white/15" : "text-red-600 hover:bg-red-100"}`}
            >
              {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <MenuIcon className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-red-100 bg-white px-4 py-3 sm:hidden">
            {navItems.map((item) => (
              <NavPill key={item.href} href={item.href} isActive={item.isActive} transparent={false} onClick={() => setMenuOpen(false)} className="w-full">
                <item.Icon className={`h-4 w-4 ${item.isActive ? "" : "text-red-500"}`} aria-hidden="true" /> {item.label}
              </NavPill>
            ))}
          </nav>
        )}
      </div>

      {/* Compact delivery-address strip: small type, stays out of the way of the nav row above it. */}
      <div
        className={`flex items-center justify-center gap-1 px-4 py-1 text-center text-[11px] leading-tight transition-colors duration-300 ${
          transparent ? "bg-transparent text-white/75" : "bg-red-50 text-ink/60"
        }`}
      >
        <MapPin className={`h-3 w-3 shrink-0 ${transparent ? "text-yellow-300" : "text-red-500"}`} aria-hidden="true" />
        {!user ? (
          <Link href="/login" className={`font-semibold underline-offset-2 hover:underline ${transparent ? "text-yellow-200" : "text-red-700"}`}>
            Log in to set your delivery address
          </Link>
        ) : defaultAddress ? (
          <span>
            Delivering to <span className={`font-semibold ${transparent ? "text-white" : "text-ink/80"}`}>{defaultAddress.area}, {defaultAddress.city}</span>{" "}
            <Link href="/account/addresses" className={`font-semibold underline-offset-2 hover:underline ${transparent ? "text-yellow-200" : "text-red-600"}`}>
              Change
            </Link>
          </span>
        ) : (
          <Link href="/account/addresses" className={`font-semibold underline-offset-2 hover:underline ${transparent ? "text-yellow-200" : "text-red-700"}`}>
            Add a delivery address
          </Link>
        )}
      </div>
    </header>
  );
}
