import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../utils/prisma";

export async function listCoupons(_req: Request, res: Response) {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ coupons });
}

const createSchema = z.object({
  code: z.string().min(1),
  type: z.enum(["FLAT", "PERCENT"]),
  value: z.coerce.number().positive(),
  minOrderValue: z.coerce.number().nonnegative().default(0),
  maxDiscount: z.coerce.number().positive().optional(),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date(),
  usageLimit: z.coerce.number().int().positive().optional(),
});

export async function createCoupon(req: Request, res: Response) {
  const data = createSchema.parse(req.body);
  const coupon = await prisma.coupon.create({ data: { ...data, code: data.code.toUpperCase() } });
  res.status(201).json({ coupon });
}

export async function toggleCouponActive(req: Request, res: Response) {
  const { active } = z.object({ active: z.boolean() }).parse(req.body);
  const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data: { active } });
  res.json({ coupon });
}

export async function deleteCoupon(req: Request, res: Response) {
  await prisma.coupon.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ ok: true });
}
