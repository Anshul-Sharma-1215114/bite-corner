import type { Request, Response } from "express";
import type { Server } from "socket.io";
import { z } from "zod";
import type { OrderStatus } from "@bite-corner/shared";
import { getNextOrderStatuses } from "@bite-corner/shared";
import type { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { isShopOpenNow } from "../utils/shop-hours";
import { isCouponUsable, computeCouponDiscount } from "../utils/coupon";

const orderInclude = {
  items: true,
  address: true,
  review: true,
  deliveryAgent: { select: { id: true, name: true, phone: true } },
} as const;

function generateOrderNumber(): string {
  const now = new Date();
  const ymd = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BC-${ymd}-${rand}`;
}

const createOrderSchema = z.object({
  type: z.enum(["DELIVERY", "TAKEAWAY", "DINE_IN"]),
  addressId: z.string().optional(),
  paymentMethod: z.enum(["COD", "UPI_MANUAL"]),
  couponCode: z.string().optional(),
  specialInstructions: z.string().optional(),
  items: z.array(
    z.union([
      z.object({ menuItemId: z.string(), quantity: z.number().int().positive() }),
      z.object({
        comboId: z.string(),
        quantity: z.number().int().positive(),
        swaps: z.array(z.object({ comboItemId: z.string(), toMenuItemId: z.string() })).optional(),
      }),
    ])
  ).min(1),
});

export async function createOrder(req: Request, res: Response) {
  const payload = createOrderSchema.parse(req.body);

  const shop = await prisma.shopConfig.findUnique({ where: { id: "shop_config" } });
  if (!shop) return res.status(500).json({ error: "Shop is not configured yet" });
  if (!isShopOpenNow(shop.openTime, shop.closeTime)) {
    return res.status(400).json({ error: "We're currently closed. Please order during business hours." });
  }

  if (payload.type === "DELIVERY" && !payload.addressId) {
    return res.status(400).json({ error: "A delivery address is required" });
  }
  if (payload.addressId) {
    const address = await prisma.address.findUnique({ where: { id: payload.addressId } });
    if (!address || address.userId !== req.user!.id) return res.status(400).json({ error: "Invalid address" });
  }

  const orderLines: {
    menuItemId: string | null;
    comboId: string | null;
    name: string;
    quantity: number;
    priceAtOrder: number;
    comboSelections: Prisma.InputJsonValue | undefined;
  }[] = [];

  for (const line of payload.items) {
    if ("menuItemId" in line) {
      const item = await prisma.menuItem.findUnique({ where: { id: line.menuItemId } });
      if (!item || !item.available) return res.status(400).json({ error: `An item in your cart is no longer available` });
      orderLines.push({ menuItemId: item.id, comboId: null, name: item.name, quantity: line.quantity, priceAtOrder: Number(item.price), comboSelections: undefined });
    } else {
      const combo = await prisma.combo.findUnique({ where: { id: line.comboId }, include: { items: { include: { menuItem: true } } } });
      if (!combo || !combo.available) return res.status(400).json({ error: "A combo in your cart is no longer available" });

      const swaps: { fromMenuItemId: string; toMenuItemId: string; fromName: string; toName: string }[] = [];
      for (const swap of line.swaps ?? []) {
        const comboItem = combo.items.find((ci) => ci.id === swap.comboItemId);
        if (!comboItem || !comboItem.swappable) return res.status(400).json({ error: "Invalid combo substitution" });
        const target = await prisma.menuItem.findUnique({ where: { id: swap.toMenuItemId } });
        if (!target || !target.available) return res.status(400).json({ error: "Substitute item is not available" });
        // A substitute can't cost more than the original slot's item — no free upsizing.
        if (Number(target.price) > Number(comboItem.menuItem.price)) {
          return res.status(400).json({ error: "That substitution isn't allowed" });
        }
        swaps.push({ fromMenuItemId: comboItem.menuItemId, toMenuItemId: target.id, fromName: comboItem.menuItem.name, toName: target.name });
      }

      orderLines.push({
        menuItemId: null,
        comboId: combo.id,
        name: combo.name,
        quantity: line.quantity,
        priceAtOrder: Number(combo.price),
        comboSelections: swaps.length > 0 ? { swaps } : undefined,
      });
    }
  }

  const itemsTotal = orderLines.reduce((sum, l) => sum + l.priceAtOrder * l.quantity, 0);
  const minOrderValue = Number(shop.minOrderValue);
  if (itemsTotal < minOrderValue) {
    return res.status(400).json({ error: `Minimum order value is ₹${minOrderValue}` });
  }

  const deliveryFee = payload.type === "DELIVERY" ? Number(shop.deliveryFee) : 0;
  const taxAmount = Math.round(itemsTotal * (Number(shop.taxPercent) / 100) * 100) / 100;

  let discountAmount = 0;
  let couponId: string | null = null;
  let couponUsageLimit: number | null = null;
  if (payload.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: payload.couponCode.toUpperCase() } });
    if (!coupon) return res.status(400).json({ error: "Invalid coupon code" });
    const problem = isCouponUsable(coupon, itemsTotal);
    if (problem) return res.status(400).json({ error: problem });
    discountAmount = computeCouponDiscount(coupon, itemsTotal);
    couponId = coupon.id;
    couponUsageLimit = coupon.usageLimit;
  }

  const totalAmount = Math.max(0, itemsTotal + deliveryFee + taxAmount - discountAmount);

  const order = await prisma.$transaction(async (tx) => {
    if (couponId) {
      // Atomic claim: the WHERE is re-evaluated by the DB against the
      // live row, so a usageLimit: 1 coupon can't be double-claimed by two
      // concurrent orders racing the earlier isCouponUsable() check above.
      const claimed = await tx.coupon.updateMany({
        where: {
          id: couponId,
          ...(couponUsageLimit !== null ? { usedCount: { lt: couponUsageLimit } } : {}),
        },
        data: { usedCount: { increment: 1 } },
      });
      if (claimed.count === 0) throw new Error("COUPON_EXHAUSTED");
    }

    return tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: req.user!.id,
        addressId: payload.type === "DELIVERY" ? payload.addressId : null,
        type: payload.type,
        paymentMethod: payload.paymentMethod,
        itemsTotal,
        deliveryFee,
        taxAmount,
        discountAmount,
        totalAmount,
        couponId,
        specialInstructions: payload.specialInstructions,
        items: { create: orderLines },
      },
      include: orderInclude,
    });
  }).catch((err) => {
    if (err instanceof Error && err.message === "COUPON_EXHAUSTED") return null;
    throw err;
  });

  if (!order) return res.status(400).json({ error: "This coupon has just been fully redeemed" });

  const io: Server = req.app.get("io");
  io.to("admin").emit("order:new", { orderId: order.id, orderNumber: order.orderNumber, totalAmount: order.totalAmount });

  res.status(201).json({ order });
}

export async function listMyOrders(req: Request, res: Response) {
  const orders = await prisma.order.findMany({
    where: { customerId: req.user!.id },
    include: orderInclude,
    orderBy: { placedAt: "desc" },
  });
  res.json({ orders });
}

export async function getOrder(req: Request, res: Response) {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: orderInclude });
  if (!order) return res.status(404).json({ error: "Order not found" });

  const isOwner = order.customerId === req.user!.id;
  const isAgent = order.deliveryAgentId === req.user!.id;
  const isAdmin = req.user!.role === "ADMIN";
  if (!isOwner && !isAgent && !isAdmin) return res.status(403).json({ error: "Not authorized" });

  res.json({ order });
}

const STATUS_TIMESTAMP_FIELD: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: "confirmedAt",
  PREPARING: "preparingAt",
  READY_FOR_PICKUP: "readyAt",
  OUT_FOR_DELIVERY: "outForDeliveryAt",
  DELIVERED: "completedAt",
  COMPLETED: "completedAt",
  CANCELLED: "cancelledAt",
  REJECTED: "cancelledAt",
};

const AGENT_ALLOWED_STATUSES = new Set<OrderStatus>(["OUT_FOR_DELIVERY", "DELIVERED"]);

const updateStatusSchema = z.object({
  status: z.enum(["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED", "REJECTED", "CANCELLED"]),
});

export async function updateOrderStatus(req: Request, res: Response) {
  const { status } = updateStatusSchema.parse(req.body);
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  if (req.user!.role === "DELIVERY_AGENT") {
    if (order.deliveryAgentId !== req.user!.id) return res.status(403).json({ error: "Not your order" });
    if (!AGENT_ALLOWED_STATUSES.has(status)) return res.status(403).json({ error: "Not authorized to set that status" });
  }

  if (!getNextOrderStatuses(order.status, order.type).includes(status)) {
    return res.status(400).json({ error: `Cannot move from ${order.status} to ${status}` });
  }

  const timestampField = STATUS_TIMESTAMP_FIELD[status];
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status, ...(timestampField ? { [timestampField]: new Date() } : {}) },
    include: orderInclude,
  });

  const io: Server = req.app.get("io");
  io.to(`order:${order.id}`).to("admin").emit("order:status", { orderId: order.id, status });

  res.json({ order: updated });
}

const CUSTOMER_CANCELLABLE_STATUSES = new Set<OrderStatus>(["PLACED", "CONFIRMED"]);

export async function cancelOrder(req: Request, res: Response) {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.customerId !== req.user!.id) return res.status(403).json({ error: "Not your order" });
  if (!CUSTOMER_CANCELLABLE_STATUSES.has(order.status)) {
    return res.status(400).json({ error: "This order can no longer be cancelled" });
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (order.couponId) {
      await tx.coupon.update({ where: { id: order.couponId }, data: { usedCount: { decrement: 1 } } });
    }
    return tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
      include: orderInclude,
    });
  });

  const io: Server = req.app.get("io");
  io.to(`order:${order.id}`).to("admin").emit("order:status", { orderId: order.id, status: "CANCELLED" });

  res.json({ order: updated });
}

export async function markOrderPaid(req: Request, res: Response) {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (["CANCELLED", "REJECTED"].includes(order.status)) return res.status(400).json({ error: "This order was not fulfilled" });
  if (req.user!.role === "DELIVERY_AGENT" && order.deliveryAgentId !== req.user!.id) {
    return res.status(403).json({ error: "Not your order" });
  }

  const updated = await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" }, include: orderInclude });

  const io: Server = req.app.get("io");
  io.to(`order:${order.id}`).to("admin").emit("order:payment-status", { orderId: order.id, paymentStatus: "PAID" });

  res.json({ order: updated });
}
