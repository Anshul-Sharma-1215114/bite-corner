import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listMyDeliveries, acceptDelivery, rejectDelivery } from "../controllers/delivery.controller";

const router = Router();

router.get("/orders", requireAuth("DELIVERY_AGENT"), listMyDeliveries);
router.post("/orders/:id/accept", requireAuth("DELIVERY_AGENT"), acceptDelivery);
router.post("/orders/:id/reject", requireAuth("DELIVERY_AGENT"), rejectDelivery);

export default router;
