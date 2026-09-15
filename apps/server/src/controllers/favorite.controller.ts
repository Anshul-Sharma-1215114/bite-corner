import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export async function listFavorites(req: Request, res: Response) {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user!.id },
    include: { menuItem: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ favorites });
}

export async function addFavorite(req: Request, res: Response) {
  await prisma.favorite.upsert({
    where: { userId_menuItemId: { userId: req.user!.id, menuItemId: req.params.menuItemId } },
    update: {},
    create: { userId: req.user!.id, menuItemId: req.params.menuItemId },
  });
  res.status(201).json({ ok: true });
}

export async function removeFavorite(req: Request, res: Response) {
  await prisma.favorite
    .delete({ where: { userId_menuItemId: { userId: req.user!.id, menuItemId: req.params.menuItemId } } })
    .catch(() => null);
  res.json({ ok: true });
}
