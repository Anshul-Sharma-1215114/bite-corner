"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CartSwap {
  comboItemId: string;
  toMenuItemId: string;
  fromName: string;
  toName: string;
}

export interface CartLine {
  key: string;
  kind: "item" | "combo";
  refId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  isVeg: boolean;
  quantity: number;
  swaps?: CartSwap[];
}

interface CartContextValue {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "key">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  itemsTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "bc_cart";

function makeKey(kind: string, refId: string, swaps?: CartSwap[]): string {
  const swapKey = swaps?.map((s) => `${s.comboItemId}:${s.toMenuItemId}`).join(",") ?? "";
  return `${kind}:${refId}:${swapKey}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setLines(JSON.parse(stored));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  function addLine(line: Omit<CartLine, "key">) {
    const key = makeKey(line.kind, line.refId, line.swaps);
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + line.quantity } : l));
      }
      return [...prev, { ...line, key }];
    });
  }

  function updateQuantity(key: string, quantity: number) {
    setLines((prev) => (quantity <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, quantity } : l))));
  }

  function removeLine(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  function clear() {
    setLines([]);
  }

  const itemsTotal = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.quantity, 0), [lines]);
  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  return (
    <CartContext.Provider value={{ lines, addLine, updateQuantity, removeLine, clear, itemsTotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
