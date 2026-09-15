import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listFavorites, addFavorite, removeFavorite } from "../controllers/favorite.controller";

const router = Router();
router.use(requireAuth("CUSTOMER"));

router.get("/", listFavorites);
router.post("/:menuItemId", addFavorite);
router.delete("/:menuItemId", removeFavorite);

export default router;
