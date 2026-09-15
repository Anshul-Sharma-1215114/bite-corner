import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../utils/prisma";

export async function listAgents(_req: Request, res: Response) {
  const agents = await prisma.user.findMany({
    where: { role: "DELIVERY_AGENT" },
    include: {
      deliveryAgentProfile: true,
      assignedOrders: { where: { status: { in: ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"] } }, select: { id: true } },
    },
    orderBy: { name: "asc" },
  });
  res.json({ agents });
}

const createAgentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  vehicleNumber: z.string().optional(),
});

export async function createAgent(req: Request, res: Response) {
  const data = createAgentSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(data.password, 10);
  const agent = await prisma.user.create({
    data: {
      role: "DELIVERY_AGENT",
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      deliveryAgentProfile: { create: { vehicleNumber: data.vehicleNumber } },
    },
    include: { deliveryAgentProfile: true },
  });
  res.status(201).json({ agent });
}

const toggleActiveSchema = z.object({ isActive: z.boolean() });

export async function toggleAgentActive(req: Request, res: Response) {
  const { isActive } = toggleActiveSchema.parse(req.body);
  const profile = await prisma.deliveryAgentProfile.update({ where: { userId: req.params.id }, data: { isActive } });
  res.json({ profile });
}
