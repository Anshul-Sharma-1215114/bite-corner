import type { Request, Response } from "express";
import { prisma } from "../../utils/prisma";

const COMPLETED_STATUSES = ["DELIVERED", "COMPLETED"];

export async function getAnalytics(req: Request, res: Response) {
  const days = Math.max(1, Number(req.query.days) || 7);
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { status: { in: COMPLETED_STATUSES as never }, placedAt: { gte: since } },
    include: { items: true },
  });

  const totalSales = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const orderVolume = orders.length;
  const averageOrderValue = orderVolume > 0 ? totalSales / orderVolume : 0;
  const completedOrders = orderVolume;

  const salesByDay = new Map<string, number>();
  for (const o of orders) {
    const key = o.placedAt.toISOString().slice(0, 10);
    salesByDay.set(key, (salesByDay.get(key) ?? 0) + Number(o.totalAmount));
  }

  const itemCounts = new Map<string, { name: string; quantity: number }>();
  for (const o of orders) {
    for (const item of o.items) {
      const key = item.menuItemId ?? item.comboId ?? item.name;
      const existing = itemCounts.get(key) ?? { name: item.name, quantity: 0 };
      existing.quantity += item.quantity;
      itemCounts.set(key, existing);
    }
  }
  const bestSellers = Array.from(itemCounts.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

  res.json({
    totalSales,
    orderVolume,
    averageOrderValue,
    completedOrders,
    salesByDay: Array.from(salesByDay.entries()).map(([date, total]) => ({ date, total })),
    bestSellers,
  });
}
