"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";
import type { OrderType, PaymentMethod } from "@bite-corner/shared";
import { apiFetch, ApiError } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { formatInr } from "@/lib/format";
import { QuantityStepper } from "@/components/quantity-stepper";
import { getSocket } from "@/lib/socket";
import type { Address, ShopConfigPublic, Order } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { EmptyState } from "@/components/ui/empty-state";

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { lines, updateQuantity, removeLine, itemsTotal, clear } = useCart();

  const [orderType, setOrderType] = useState<OrderType>("DELIVERY");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [shopConfig, setShopConfig] = useState<ShopConfigPublic | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [unavailableKeys, setUnavailableKeys] = useState<Set<string>>(new Set());

  function checkAvailability() {
    Promise.all([
      apiFetch<{ items: { id: string }[] }>("/api/menu-items"),
      apiFetch<{ combos: { id: string }[] }>("/api/combos"),
    ]).then(([itemsRes, combosRes]) => {
      const availableItemIds = new Set(itemsRes.items.map((i) => i.id));
      const availableComboIds = new Set(combosRes.combos.map((c) => c.id));
      setUnavailableKeys(new Set(lines.filter((l) => !(l.kind === "item" ? availableItemIds : availableComboIds).has(l.refId)).map((l) => l.key)));
    });
  }

  useEffect(checkAvailability, [lines]);
  useEffect(() => {
    const socket = getSocket();
    socket.on("menu:item-updated", checkAvailability);
    return () => {
      socket.off("menu:item-updated", checkAvailability);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  useEffect(() => {
    apiFetch<ShopConfigPublic>("/api/shop-config/public").then(setShopConfig);
    if (user?.role === "CUSTOMER") {
      apiFetch<{ addresses: Address[] }>("/api/addresses")
        .then((d) => {
          setAddresses(d.addresses);
          const def = d.addresses.find((a) => a.isDefault) ?? d.addresses[0];
          if (def) setSelectedAddressId(def.id);
        })
        .catch(() => setAddresses([]));
    }
  }, [user]);

  const deliveryFee = useMemo(() => {
    if (orderType !== "DELIVERY" || !shopConfig) return 0;
    return Number(shopConfig.deliveryFee);
  }, [orderType, shopConfig]);

  const taxAmount = useMemo(() => {
    if (!shopConfig) return 0;
    return Math.round(itemsTotal * (Number(shopConfig.taxPercent) / 100) * 100) / 100;
  }, [itemsTotal, shopConfig]);

  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const totalAmount = Math.max(0, itemsTotal + deliveryFee + taxAmount - discountAmount);
  const minOrderValue = shopConfig ? Number(shopConfig.minOrderValue) : 0;
  const belowMinimum = itemsTotal < minOrderValue;
  const addressRequired = orderType === "DELIVERY";
  const shopClosed = shopConfig !== null && !shopConfig.isOpenNow;
  const canPlaceOrder = lines.length > 0 && !belowMinimum && !shopClosed && unavailableKeys.size === 0 && (!addressRequired || selectedAddressId);

  async function applyCoupon() {
    setCouponError(null);
    try {
      const data = await apiFetch<{ discountAmount: number }>("/api/coupons/validate", { method: "POST", body: JSON.stringify({ code: couponCode, orderTotal: itemsTotal }) });
      setAppliedCoupon({ code: couponCode.toUpperCase(), discountAmount: data.discountAmount });
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof ApiError ? err.message : "Failed to apply coupon");
    }
  }

  useEffect(() => {
    if (!appliedCoupon) return;
    apiFetch<{ discountAmount: number }>("/api/coupons/validate", { method: "POST", body: JSON.stringify({ code: appliedCoupon.code, orderTotal: itemsTotal }) })
      .then((data) => setAppliedCoupon((prev) => (prev ? { ...prev, discountAmount: data.discountAmount } : prev)))
      .catch((err) => {
        setAppliedCoupon(null);
        setCouponError(`"${appliedCoupon.code}" no longer applies: ${err instanceof ApiError ? err.message : "cart changed"}`);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsTotal]);

  async function placeOrder() {
    if (!user) return router.push("/login");
    setPlaceError(null);
    setPlacing(true);
    try {
      const payload = {
        type: orderType,
        addressId: orderType === "DELIVERY" ? selectedAddressId : undefined,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        specialInstructions: specialInstructions || undefined,
        items: lines.map((l) =>
          l.kind === "item"
            ? { menuItemId: l.refId, quantity: l.quantity }
            : { comboId: l.refId, quantity: l.quantity, swaps: l.swaps?.map((s) => ({ comboItemId: s.comboItemId, toMenuItemId: s.toMenuItemId })) }
        ),
      };

      const data = await apiFetch<{ order: Order }>("/api/orders", { method: "POST", body: JSON.stringify(payload) });

      clear();
      router.push(`/orders/${data.order.id}?justPlaced=1`);
    } catch (err) {
      setPlaceError(err instanceof ApiError ? err.message : "Failed to place order");
      setPlacing(false);
    }
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6">
        <EmptyState icon={<ShoppingCart className="h-7 w-7" />} title="Your cart is empty" action={{ label: "Browse the menu", href: "/" }} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 font-display text-xl font-bold">Your cart</h1>

      {shopClosed && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          We&apos;re currently closed. Ordering is available {shopConfig?.openTime}-{shopConfig?.closeTime}. You can still browse and build your cart.
        </div>
      )}
      {unavailableKeys.size > 0 && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Some items in your cart are no longer available. Remove them to continue.</div>
      )}

      <div className="flex flex-col gap-3">
        {lines.map((line) => {
          const isUnavailable = unavailableKeys.has(line.key);
          return (
            <Card key={line.key} padded={false} className={`p-3 ${isUnavailable ? "!border-red-200 bg-red-50" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{line.name}</p>
                  {isUnavailable && <p className="text-xs font-medium text-red-600">No longer available</p>}
                  {line.swaps?.map((s) => (
                    <p key={s.comboItemId} className="truncate text-xs text-ink/50">Swapped {s.fromName} → {s.toName}</p>
                  ))}
                  <p className="text-sm text-red-600">{formatInr(line.price)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
                  {!isUnavailable && <QuantityStepper quantity={line.quantity} onChange={(q) => updateQuantity(line.key, q)} />}
                  <IconButton icon={<Trash2 className="h-4 w-4" />} label="Remove item" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => removeLine(line.key)} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6">
        <h2 className="mb-2 font-semibold">Order type</h2>
        <div className="flex flex-wrap gap-2">
          {(["DELIVERY", "TAKEAWAY", "DINE_IN"] as const).map((t) => (
            <Chip key={t} active={orderType === t} onClick={() => setOrderType(t)}>{t === "DELIVERY" ? "Delivery" : t === "TAKEAWAY" ? "Takeaway" : "Dine-in"}</Chip>
          ))}
        </div>
      </div>

      {orderType === "DELIVERY" && (
        <div className="mt-4">
          <h2 className="mb-2 font-semibold">Deliver to</h2>
          {!user ? (
            <p className="text-sm text-ink/50">
              <Link href="/login" className="text-red-600 underline">Log in</Link> to choose a delivery address.
            </p>
          ) : addresses.length === 0 ? (
            <Link href="/account/addresses" className="text-sm text-red-600 underline">+ Add a delivery address</Link>
          ) : (
            <div className="flex flex-col gap-2">
              {addresses.map((a) => (
                <label key={a.id} className={`flex cursor-pointer items-start gap-2 rounded-xl border-2 p-3 text-sm transition ${selectedAddressId === a.id ? "border-red-400 bg-red-50 shadow-soft" : "border-ink/10 bg-white"}`}>
                  <input type="radio" checked={selectedAddressId === a.id} onChange={() => setSelectedAddressId(a.id)} className="mt-1" />
                  <span><span className="font-medium">{a.label}</span> — {a.line1}, {a.area}, {a.city}</span>
                </label>
              ))}
              <Link href="/account/addresses" className="text-xs text-red-600 underline">+ Add another address</Link>
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <h2 className="mb-2 font-semibold">Coupon</h2>
        {appliedCoupon ? (
          <p className="text-sm text-green-700">
            &quot;{appliedCoupon.code}&quot; applied — you saved {formatInr(appliedCoupon.discountAmount)}
            <button onClick={() => setAppliedCoupon(null)} className="ml-2 text-xs text-ink/50 underline">remove</button>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon code" className="flex-1 rounded-full border border-ink/15 bg-white px-4 py-2 text-sm shadow-soft focus:border-red-400 focus:outline-none" />
            <Button variant="outline" size="sm" onClick={applyCoupon}>Apply</Button>
          </div>
        )}
        {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
      </div>

      <div className="mt-4">
        <h2 className="mb-2 font-semibold">Payment method</h2>
        <div className="flex flex-wrap gap-2">
          <Chip active={paymentMethod === "COD"} onClick={() => setPaymentMethod("COD")}>Cash on {orderType === "DELIVERY" ? "Delivery" : "Pickup"}</Chip>
          <Chip active={paymentMethod === "UPI_MANUAL"} onClick={() => setPaymentMethod("UPI_MANUAL")}>Pay via UPI on {orderType === "DELIVERY" ? "delivery" : "pickup"}</Chip>
        </div>
        {paymentMethod === "UPI_MANUAL" && (
          <p className="mt-2 text-xs text-ink/50">You&apos;ll see the shop&apos;s UPI QR code on the next screen — scan it with any UPI app and pay {orderType === "DELIVERY" ? "the delivery agent" : "at the counter"} directly. No online payment is processed through this app.</p>
        )}
      </div>

      <textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} placeholder="Any special instructions? (optional)" className="mt-4 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" rows={2} />

      <Card className="mt-6 text-sm">
        <div className="flex justify-between"><span>Item total</span><span>{formatInr(itemsTotal)}</span></div>
        {orderType === "DELIVERY" && <div className="flex justify-between"><span>Delivery fee</span><span>{formatInr(deliveryFee)}</span></div>}
        <div className="flex justify-between"><span>Taxes</span><span>{formatInr(taxAmount)}</span></div>
        {discountAmount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-{formatInr(discountAmount)}</span></div>}
        <div className="mt-2 flex justify-between border-t border-red-100 pt-2 text-base font-bold"><span>Total</span><span className="text-red-700">{formatInr(totalAmount)}</span></div>
      </Card>

      {belowMinimum && <p className="mt-2 text-sm text-red-600">Add {formatInr(minOrderValue - itemsTotal)} more to meet the {formatInr(minOrderValue)} minimum order value.</p>}
      {placeError && <p className="mt-2 text-sm text-red-600">{placeError}</p>}

      <Button onClick={placeOrder} disabled={!canPlaceOrder || placing || authLoading} loading={placing} fullWidth size="lg" className="mt-4">
        {placing ? "Placing order..." : !user ? "Log in to place order" : shopClosed ? "We're currently closed" : unavailableKeys.size > 0 ? "Remove unavailable items to continue" : `Place order — ${formatInr(totalAmount)}`}
      </Button>
    </main>
  );
}
