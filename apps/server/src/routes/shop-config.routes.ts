import { Router } from "express";
import { prisma } from "../utils/prisma";
import { isShopOpenNow } from "../utils/shop-hours";

const router = Router();

router.get("/public", async (_req, res) => {
  const shop = await prisma.shopConfig.findUnique({ where: { id: "shop_config" } });
  if (!shop) return res.status(404).json({ error: "Shop config not found" });
  res.json({
    name: shop.name,
    deliveryFee: shop.deliveryFee,
    minOrderValue: shop.minOrderValue,
    taxPercent: shop.taxPercent,
    openTime: shop.openTime,
    closeTime: shop.closeTime,
    address: shop.address,
    upiId: shop.upiId,
    whatsappNumber: shop.whatsappNumber,
    isOpenNow: isShopOpenNow(shop.openTime, shop.closeTime),
  });
});

export default router;
