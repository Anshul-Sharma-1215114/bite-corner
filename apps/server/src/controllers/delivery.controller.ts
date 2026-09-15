import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export async function listMyDeliveries(req: Request, res: Response) {
  const orders = await prisma.order.findMany({
    where: { deliveryAgentId: req.user!.id },
    include: {
      items: true,
      address: true,
      review: true,
      customer: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { placedAt: "desc" },
  });
  res.json({ orders });
}
