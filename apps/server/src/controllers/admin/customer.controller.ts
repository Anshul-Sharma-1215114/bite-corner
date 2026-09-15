import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../utils/prisma";

export async function listCustomers(_req: Request, res: Response) {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ customers });
}

export async function getCustomer(req: Request, res: Response) {
  const customer = await prisma.user.findUnique({
    where: { id: req.params.id, role: "CUSTOMER" },
    include: { addresses: true, orders: { include: { items: true }, orderBy: { placedAt: "desc" } } },
  });
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  res.json({ customer });
}

export async function toggleCustomerBlock(req: Request, res: Response) {
  const { isBlocked } = z.object({ isBlocked: z.boolean() }).parse(req.body);
  const customer = await prisma.user.update({ where: { id: req.params.id }, data: { isBlocked } });
  res.json({ customer });
}
