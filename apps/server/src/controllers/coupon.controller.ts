import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { isCouponUsable, computeCouponDiscount } from "../utils/coupon";

// Public, non-sensitive subset of currently-usable coupons — powers a
// promo banner on the homepage. Codes are meant to be shared with
// customers anyway, so exposing them here isn't a leak.
export async function listActiveCoupons(_req: Request, res: Response) {
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: { active: true, validFrom: { lte: now }, validTo: { gte: now } },
    orderBy: { createdAt: "desc" },
  });
  res.json({
    coupons: coupons
      .filter((c) => c.usageLimit === null || c.usedCount < c.usageLimit)
      .map((c) => ({ code: c.code, type: c.type, value: c.value, minOrderValue: c.minOrderValue })),
  });
}

const validateSchema = z.object({ code: z.string().min(1), orderTotal: z.number().nonnegative() });

export async function validateCoupon(req: Request, res: Response) {
  const { code, orderTotal } = validateSchema.parse(req.body);
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) return res.status(404).json({ error: "Invalid coupon code" });

  const problem = isCouponUsable(coupon, orderTotal);
  if (problem) return res.status(400).json({ error: problem });

  res.json({ discountAmount: computeCouponDiscount(coupon, orderTotal) });
}
