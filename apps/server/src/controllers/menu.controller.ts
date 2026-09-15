import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import type { Prisma } from "@prisma/client";

export async function listCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  res.json({ categories });
}

export async function listMenuItems(req: Request, res: Response) {
  const { category, search, veg, maxPrice } = req.query as Record<string, string | undefined>;

  const where: Prisma.MenuItemWhereInput = { available: true };
  if (category) where.categoryId = category;
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (veg === "true") where.isVeg = true;
  if (veg === "false") where.isVeg = false;
  if (maxPrice) where.price = { lte: Number(maxPrice) };

  const items = await prisma.menuItem.findMany({ where, include: { category: true }, orderBy: { name: "asc" } });
  res.json({ items });
}

// Ranked by real order volume (grouped OrderItem counts), not a hardcoded
// list — falls back to newest items until enough order history exists.
export async function listPopularMenuItems(_req: Request, res: Response) {
  const grouped = await prisma.orderItem.groupBy({
    by: ["menuItemId"],
    where: { menuItemId: { not: null } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 8,
  });

  const ids = grouped.map((g) => g.menuItemId).filter((id): id is string => Boolean(id));
  let items;
  if (ids.length > 0) {
    const rows = await prisma.menuItem.findMany({ where: { id: { in: ids }, available: true }, include: { category: true } });
    const byId = new Map(rows.map((r) => [r.id, r]));
    items = ids.map((id) => byId.get(id)).filter(Boolean);
  }
  if (!items || items.length === 0) {
    items = await prisma.menuItem.findMany({ where: { available: true }, include: { category: true }, orderBy: { createdAt: "desc" }, take: 8 });
  }
  res.json({ items });
}

export async function getMenuItem(req: Request, res: Response) {
  const item = await prisma.menuItem.findUnique({ where: { id: req.params.id }, include: { category: true } });
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json({ item });
}

export async function listCombos(_req: Request, res: Response) {
  const combos = await prisma.combo.findMany({
    where: { available: true },
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ combos });
}

export async function getCombo(req: Request, res: Response) {
  const combo = await prisma.combo.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { menuItem: true } } },
  });
  if (!combo) return res.status(404).json({ error: "Combo not found" });

  const substitutionOptions: Record<string, unknown[]> = {};
  for (const comboItem of combo.items) {
    if (comboItem.swappable) {
      substitutionOptions[comboItem.id] = await prisma.menuItem.findMany({
        where: { categoryId: comboItem.menuItem.categoryId, available: true, id: { not: comboItem.menuItemId } },
      });
    }
  }
  res.json({ combo, substitutionOptions });
}
