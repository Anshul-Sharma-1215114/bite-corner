import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";

export async function listFeaturedReviews(_req: Request, res: Response) {
  const reviews = await prisma.review.findMany({
    where: { rating: { gte: 4 }, comment: { not: null } },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  res.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      customerName: r.customer.name,
      createdAt: r.createdAt,
    })),
  });
}

const submitReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function submitReview(req: Request, res: Response) {
  const { rating, comment } = submitReviewSchema.parse(req.body);
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order || order.customerId !== req.user!.id) return res.status(404).json({ error: "Order not found" });
  if (!["DELIVERED", "COMPLETED"].includes(order.status)) {
    return res.status(400).json({ error: "You can only review a completed order" });
  }

  const review = await prisma.review.upsert({
    where: { orderId: order.id },
    update: { rating, comment },
    create: { orderId: order.id, customerId: req.user!.id, rating, comment },
  });
  res.status(201).json({ review });
}
