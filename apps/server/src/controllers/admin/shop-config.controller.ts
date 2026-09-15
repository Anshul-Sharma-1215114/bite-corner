import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../utils/prisma";

export async function getShopConfig(_req: Request, res: Response) {
  const shop = await prisma.shopConfig.upsert({
    where: { id: "shop_config" },
    update: {},
    create: { id: "shop_config" },
  });
  res.json({ shop });
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  deliveryFee: z.coerce.number().nonnegative().optional(),
  minOrderValue: z.coerce.number().nonnegative().optional(),
  taxPercent: z.coerce.number().min(0).max(100).optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  address: z.string().optional(),
  upiId: z.string().optional(),
  whatsappNumber: z.string().optional(),
});

export async function updateShopConfig(req: Request, res: Response) {
  const data = updateSchema.parse(req.body);
  const shop = await prisma.shopConfig.upsert({
    where: { id: "shop_config" },
    update: data,
    create: { id: "shop_config", ...data },
  });
  res.json({ shop });
}
