import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";

export async function listAddresses(req: Request, res: Response) {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  res.json({ addresses });
}

const addressSchema = z.object({
  label: z.enum(["HOME", "WORK", "OTHER"]),
  line1: z.string().min(1),
  landmark: z.string().optional(),
  area: z.string().min(1),
  city: z.string().min(1),
  pincode: z.string().min(1),
});

export async function createAddress(req: Request, res: Response) {
  const data = addressSchema.parse(req.body);
  const existingCount = await prisma.address.count({ where: { userId: req.user!.id } });
  const address = await prisma.address.create({
    data: { ...data, userId: req.user!.id, isDefault: existingCount === 0 },
  });
  res.status(201).json({ address });
}

const updateAddressSchema = addressSchema.partial().extend({ isDefault: z.boolean().optional() });

export async function updateAddress(req: Request, res: Response) {
  const data = updateAddressSchema.parse(req.body);
  const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user!.id) return res.status(404).json({ error: "Address not found" });

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
  }
  const address = await prisma.address.update({ where: { id: req.params.id }, data });
  res.json({ address });
}

export async function deleteAddress(req: Request, res: Response) {
  const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user!.id) return res.status(404).json({ error: "Address not found" });
  await prisma.address.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}
