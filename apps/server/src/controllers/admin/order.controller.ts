import type { Request, Response } from "express";
import type { Server } from "socket.io";
import { z } from "zod";
import { prisma } from "../../utils/prisma";

export async function listAdminOrders(req: Request, res: Response) {
  const { status } = req.query as { status?: string };
  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    include: {
      items: true,
      address: true,
      customer: { select: { id: true, name: true, phone: true } },
      deliveryAgent: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { placedAt: "desc" },
  });
  res.json({ orders });
}

const FINISHED_STATUSES = new Set(["CANCELLED", "REJECTED", "DELIVERED", "COMPLETED"]);

const assignAgentSchema = z.object({ deliveryAgentId: z.string().min(1) });

export async function assignDeliveryAgent(req: Request, res: Response) {
  const { deliveryAgentId } = assignAgentSchema.parse(req.body);
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.type !== "DELIVERY") return res.status(400).json({ error: "Only delivery orders can be assigned an agent" });
  if (FINISHED_STATUSES.has(order.status)) return res.status(400).json({ error: "This order is already finished" });

  const agent = await prisma.user.findUnique({ where: { id: deliveryAgentId }, include: { deliveryAgentProfile: true } });
  if (!agent || agent.role !== "DELIVERY_AGENT") return res.status(400).json({ error: "Invalid delivery agent" });
  if (!agent.deliveryAgentProfile?.isActive) return res.status(400).json({ error: "This agent is deactivated" });

  const updated = await prisma.order.update({ where: { id: order.id }, data: { deliveryAgentId: agent.id, deliveryAcceptedAt: null } });

  const io: Server = req.app.get("io");
  const payload = { orderId: order.id, orderNumber: order.orderNumber, agentId: agent.id, agentName: agent.name, agentPhone: agent.phone };
  io.to(`order:${order.id}`).to("admin").to(`agent:${agent.id}`).emit("order:agent-assigned", payload);

  res.json({ order: updated });
}
