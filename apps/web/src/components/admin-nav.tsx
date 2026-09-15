"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LogoMark } from "./logo-mark";
import { Button } from "./ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/delivery", label: "Delivery" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b-4 border-yellow-400 bg-white shadow-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/admin" className="flex shrink-0 items-center gap-2">
          <LogoMark className="h-8 w-8" />
          <span className="font-display text-lg font-bold">Bite Corner Admin</span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${isActive ? "bg-red-500 text-white" : "text-ink/70 hover:bg-red-50"}`}>
                {item.label}
              </Link>
            );
          })}
          <Button variant="ghost" size="sm" onClick={logout}>Log out</Button>
        </nav>
        <button onClick={() => setMenuOpen((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-red-50 sm:hidden" aria-label="Toggle menu">
          {menuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>
      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-red-100 bg-white px-4 py-3 sm:hidden">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-red-50">
              {item.label}
            </Link>
          ))}
          <Button variant="ghost" size="sm" onClick={logout} className="mt-2 justify-start">Log out</Button>
        </nav>
      )}
    </header>
  );
}
