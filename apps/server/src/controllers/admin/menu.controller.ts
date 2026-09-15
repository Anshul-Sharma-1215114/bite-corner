import type { Request, Response } from "express";
import type { Server } from "socket.io";
import { z } from "zod";
import { prisma } from "../../utils/prisma";
import { publicUrlFor } from "../../middleware/upload";

function notifyMenuUpdated(req: Request, menuItemId?: string) {
  const io: Server = req.app.get("io");
  io.emit("menu:item-updated", { menuItemId });
}

// Categories
const categorySchema = z.object({ name: z.string().min(1), sortOrder: z.number().int().optional() });

export async function createCategory(req: Request, res: Response) {
  const data = categorySchema.parse(req.body);
  const category = await prisma.category.create({ data });
  res.status(201).json({ category });
}

export async function deleteCategory(req: Request, res: Response) {
  await prisma.category.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ ok: true });
}

// Menu items
export async function listAdminMenuItems(_req: Request, res: Response) {
  const items = await prisma.menuItem.findMany({ include: { category: true }, orderBy: { name: "asc" } });
  res.json({ items });
}

const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  categoryId: z.string().min(1),
  isVeg: z.coerce.boolean().optional(),
});

export async function createMenuItem(req: Request, res: Response) {
  const data = menuItemSchema.parse(req.body);
  const imageUrl = req.file ? publicUrlFor(req.file.filename) : undefined;
  const item = await prisma.menuItem.create({ data: { ...data, imageUrl } });
  notifyMenuUpdated(req, item.id);
  res.status(201).json({ item });
}

export async function updateMenuItem(req: Request, res: Response) {
  const data = menuItemSchema.partial().parse(req.body);
  const imageUrl = req.file ? publicUrlFor(req.file.filename) : undefined;
  const item = await prisma.menuItem.update({ where: { id: req.params.id }, data: { ...data, ...(imageUrl ? { imageUrl } : {}) } });
  notifyMenuUpdated(req, item.id);
  res.json({ item });
}

export async function updateMenuItemAvailability(req: Request, res: Response) {
  const { available } = z.object({ available: z.boolean() }).parse(req.body);
  const item = await prisma.menuItem.update({ where: { id: req.params.id }, data: { available } });
  notifyMenuUpdated(req, item.id);
  res.json({ item });
}

export async function deleteMenuItem(req: Request, res: Response) {
  await prisma.menuItem.delete({ where: { id: req.params.id } }).catch(() => null);
  notifyMenuUpdated(req, req.params.id);
  res.json({ ok: true });
}

// Combos
export async function listAdminCombos(_req: Request, res: Response) {
  const combos = await prisma.combo.findMany({ include: { items: { include: { menuItem: true } } }, orderBy: { name: "asc" } });
  res.json({ combos });
}

const comboSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  items: z
    .string()
    .transform((s) => JSON.parse(s) as { menuItemId: string; quantity: number; swappable: boolean }[]),
});

export async function createCombo(req: Request, res: Response) {
  const data = comboSchema.parse(req.body);
  const imageUrl = req.file ? publicUrlFor(req.file.filename) : undefined;
  const combo = await prisma.combo.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl,
      items: { create: data.items },
    },
    include: { items: { include: { menuItem: true } } },
  });
  notifyMenuUpdated(req);
  res.status(201).json({ combo });
}

export async function updateCombo(req: Request, res: Response) {
  const data = comboSchema.partial().parse(req.body);
  const imageUrl = req.file ? publicUrlFor(req.file.filename) : undefined;

  if (data.items) {
    await prisma.comboItem.deleteMany({ where: { comboId: req.params.id } });
  }

  const combo = await prisma.combo.update({
    where: { id: req.params.id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      ...(imageUrl ? { imageUrl } : {}),
      ...(data.items ? { items: { create: data.items } } : {}),
    },
    include: { items: { include: { menuItem: true } } },
  });
  notifyMenuUpdated(req);
  res.json({ combo });
}

export async function deleteCombo(req: Request, res: Response) {
  await prisma.combo.delete({ where: { id: req.params.id } }).catch(() => null);
  notifyMenuUpdated(req);
  res.json({ ok: true });
}
