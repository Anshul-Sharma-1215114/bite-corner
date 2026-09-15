import { Router } from "express";
import {
  listCategories,
  listMenuItems,
  listPopularMenuItems,
  getMenuItem,
  listCombos,
  getCombo,
} from "../controllers/menu.controller";

const router = Router();

router.get("/categories", listCategories);
router.get("/menu-items/popular", listPopularMenuItems);
router.get("/menu-items/:id", getMenuItem);
router.get("/menu-items", listMenuItems);
router.get("/combos/:id", getCombo);
router.get("/combos", listCombos);

export default router;
