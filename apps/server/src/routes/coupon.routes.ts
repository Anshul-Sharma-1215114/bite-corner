import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateCoupon, listActiveCoupons } from "../controllers/coupon.controller";

const router = Router();

router.get("/active", listActiveCoupons);
router.post("/validate", requireAuth("CUSTOMER"), validateCoupon);

export default router;
