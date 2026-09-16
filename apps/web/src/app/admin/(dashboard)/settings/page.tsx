"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { UpiQrCode } from "@/components/upi-qr-code";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ShopConfigAdmin {
  name: string;
  deliveryFee: string;
  minOrderValue: string;
  taxPercent: string;
  openTime: string;
  closeTime: string;
  address: string | null;
  upiId: string | null;
  whatsappNumber: string | null;
}

interface Coupon {
  id: string;
  code: string;
  type: "FLAT" | "PERCENT";
  value: string;
  minOrderValue: string;
  maxDiscount: string | null;
  validTo: string;
  active: boolean;
}

export default function AdminSettingsPage() {
  const [shop, setShop] = useState<ShopConfigAdmin | null>(null);
  const [saving, setSaving] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: "", type: "PERCENT" as "FLAT" | "PERCENT", value: "", minOrderValue: "0", maxDiscount: "", validTo: "" });

  function loadShop() {
    apiFetch<{ shop: ShopConfigAdmin }>("/api/admin/shop-config").then((d) => setShop(d.shop));
  }
  function loadCoupons() {
    apiFetch<{ coupons: Coupon[] }>("/api/admin/coupons").then((d) => setCoupons(d.coupons));
  }
  useEffect(() => {
    loadShop();
    loadCoupons();
  }, []);

  async function saveShop(e: React.FormEvent) {
    e.preventDefault();
    if (!shop) return;
    setSaving(true);
    try {
      await apiFetch("/api/admin/shop-config", { method: "PATCH", body: JSON.stringify(shop) });
    } finally {
      setSaving(false);
    }
  }

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    await apiFetch("/api/admin/coupons", {
      method: "POST",
      body: JSON.stringify({
        code: couponForm.code,
        type: couponForm.type,
        value: Number(couponForm.value),
        minOrderValue: Number(couponForm.minOrderValue),
        maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : undefined,
        validFrom: new Date().toISOString(),
        validTo: new Date(couponForm.validTo).toISOString(),
      }),
    });
    setShowCouponForm(false);
    setCouponForm({ code: "", type: "PERCENT", value: "", minOrderValue: "0", maxDiscount: "", validTo: "" });
    loadCoupons();
  }

  async function toggleCoupon(id: string, active: boolean) {
    await apiFetch(`/api/admin/coupons/${id}`, { method: "PATCH", body: JSON.stringify({ active }) });
    loadCoupons();
  }

  async function deleteCoupon(id: string) {
    await apiFetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    loadCoupons();
  }

  if (!shop) return <p className="text-sm text-ink/50">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      <Card className="mt-4">
        <h2 className="mb-3 font-semibold">Shop Config</h2>
        <form onSubmit={saveShop} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">Name<input value={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })} className="rounded-lg border border-ink/15 px-3 py-2" /></label>
          <label className="flex flex-col gap-1 text-sm">Delivery fee<input type="number" value={shop.deliveryFee} onChange={(e) => setShop({ ...shop, deliveryFee: e.target.value })} className="rounded-lg border border-ink/15 px-3 py-2" /></label>
          <label className="flex flex-col gap-1 text-sm">Min order value<input type="number" value={shop.minOrderValue} onChange={(e) => setShop({ ...shop, minOrderValue: e.target.value })} className="rounded-lg border border-ink/15 px-3 py-2" /></label>
          <label className="flex flex-col gap-1 text-sm">Tax %<input type="number" value={shop.taxPercent} onChange={(e) => setShop({ ...shop, taxPercent: e.target.value })} className="rounded-lg border border-ink/15 px-3 py-2" /></label>
          <label className="flex flex-col gap-1 text-sm">Open time<input value={shop.openTime} onChange={(e) => setShop({ ...shop, openTime: e.target.value })} className="rounded-lg border border-ink/15 px-3 py-2" /></label>
          <label className="flex flex-col gap-1 text-sm">Close time<input value={shop.closeTime} onChange={(e) => setShop({ ...shop, closeTime: e.target.value })} className="rounded-lg border border-ink/15 px-3 py-2" /></label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">Address<input value={shop.address ?? ""} onChange={(e) => setShop({ ...shop, address: e.target.value })} className="rounded-lg border border-ink/15 px-3 py-2" /></label>
          <label className="flex flex-col gap-1 text-sm">UPI ID<input value={shop.upiId ?? ""} onChange={(e) => setShop({ ...shop, upiId: e.target.value })} className="rounded-lg border border-ink/15 px-3 py-2" /></label>
          <label className="flex flex-col gap-1 text-sm">WhatsApp number<input value={shop.whatsappNumber ?? ""} onChange={(e) => setShop({ ...shop, whatsappNumber: e.target.value })} className="rounded-lg border border-ink/15 px-3 py-2" /></label>
          <div className="sm:col-span-2"><Button type="submit" loading={saving}>Save</Button></div>
        </form>
        {shop.upiId && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-ink/60">UPI QR preview:</p>
            <UpiQrCode upiId={shop.upiId} shopName={shop.name} />
          </div>
        )}
      </Card>

      <div className="mt-6 mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Coupons</h2>
        {!showCouponForm && <Button size="sm" onClick={() => setShowCouponForm(true)}>+ Add coupon</Button>}
      </div>

      {showCouponForm && (
        <form onSubmit={createCoupon} className="mb-4 flex flex-col gap-3 rounded-2xl border border-yellow-300 bg-yellow-50 p-4 shadow-soft">
          <input required placeholder="Code (e.g. FLAT50)" value={couponForm.code} onChange={(e) => setCouponForm((f) => ({ ...f, code: e.target.value }))} className="rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          <div className="flex gap-3">
            <select value={couponForm.type} onChange={(e) => setCouponForm((f) => ({ ...f, type: e.target.value as "FLAT" | "PERCENT" }))} className="rounded-lg border border-ink/15 px-3 py-2 text-sm">
              <option value="PERCENT">Percent off</option>
              <option value="FLAT">Flat amount off</option>
            </select>
            <input required type="number" placeholder="Value" value={couponForm.value} onChange={(e) => setCouponForm((f) => ({ ...f, value: e.target.value }))} className="w-28 rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3">
            <input type="number" placeholder="Min order value" value={couponForm.minOrderValue} onChange={(e) => setCouponForm((f) => ({ ...f, minOrderValue: e.target.value }))} className="w-36 rounded-lg border border-ink/15 px-3 py-2 text-sm" />
            {couponForm.type === "PERCENT" && (
              <input type="number" placeholder="Max discount (optional)" value={couponForm.maxDiscount} onChange={(e) => setCouponForm((f) => ({ ...f, maxDiscount: e.target.value }))} className="w-40 rounded-lg border border-ink/15 px-3 py-2 text-sm" />
            )}
          </div>
          <label className="flex flex-col gap-1 text-sm">Valid until<input required type="date" value={couponForm.validTo} onChange={(e) => setCouponForm((f) => ({ ...f, validTo: e.target.value }))} className="rounded-lg border border-ink/15 px-3 py-2" /></label>
          <div className="flex gap-2">
            <Button type="submit" size="sm">Create coupon</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCouponForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {coupons.map((c) => (
          <Card key={c.id} className="flex items-center justify-between">
            <div>
              <span className="font-mono font-bold">{c.code}</span>
              <span className="ml-2 text-sm text-ink/60">{c.type === "PERCENT" ? `${Number(c.value)}% off` : `₹${c.value} off`} · min ₹{c.minOrderValue}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleCoupon(c.id, !c.active)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.active ? "bg-green-100 text-green-700" : "bg-ink/10 text-ink/50"}`}>
                {c.active ? "Active" : "Inactive"}
              </button>
              <Button size="sm" variant="ghost" onClick={() => deleteCoupon(c.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
