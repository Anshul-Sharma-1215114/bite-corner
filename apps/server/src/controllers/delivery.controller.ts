import type { Request, Response } from "express";
import type { Server } from "socket.io";
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

async function findOwnPendingAssignment(orderId: string, agentId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.deliveryAgentId !== agentId) return null;
  if (order.deliveryAcceptedAt) return null;
  return order;
}

export async function acceptDelivery(req: Request, res: Response) {
  const order = await findOwnPendingAssignment(req.params.id, req.user!.id);
  if (!order) return res.status(404).json({ error: "No pending assignment found for this order" });

  const updated = await prisma.order.update({ where: { id: order.id }, data: { deliveryAcceptedAt: new Date() } });

  const io: Server = req.app.get("io");
  io.to(`order:${order.id}`).to("admin").emit("order:agent-accepted", { orderId: order.id, orderNumber: order.orderNumber });

  res.json({ order: updated });
}

export async function rejectDelivery(req: Request, res: Response) {
  const order = await findOwnPendingAssignment(req.params.id, req.user!.id);
  if (!order) return res.status(404).json({ error: "No pending assignment found for this order" });

  // Back to unassigned — the admin picks a different agent. Not a whole
  // separate rejectedAt/history field for now; that's more than this
  // needs until there's a reason to show a rejection trail.
  const updated = await prisma.order.update({ where: { id: order.id }, data: { deliveryAgentId: null, deliveryAcceptedAt: null } });

  const io: Server = req.app.get("io");
  io.to(`order:${order.id}`).to("admin").emit("order:agent-rejected", { orderId: order.id, orderNumber: order.orderNumber, agentId: req.user!.id });

  res.json({ order: updated });
}
