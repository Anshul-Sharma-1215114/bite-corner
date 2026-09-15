import type { Coupon } from "@prisma/client";

export function isCouponUsable(coupon: Coupon, orderTotal: number): string | null {
  const now = new Date();
  if (!coupon.active) return "This coupon is no longer active.";
  if (now < coupon.validFrom || now > coupon.validTo) return "This coupon has expired.";
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return "This coupon has been fully redeemed.";
  if (orderTotal < Number(coupon.minOrderValue)) {
    return `Minimum order value for this coupon is ₹${coupon.minOrderValue}.`;
  }
  return null;
}

export function computeCouponDiscount(coupon: Coupon, orderTotal: number): number {
  let discount: number;
  if (coupon.type === "FLAT") {
    discount = Math.min(Number(coupon.value), orderTotal);
  } else {
    discount = (orderTotal * Number(coupon.value)) / 100;
    if (coupon.maxDiscount !== null) discount = Math.min(discount, Number(coupon.maxDiscount));
  }
  return Math.min(Math.round(discount * 100) / 100, orderTotal);
}
