import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { uploadImage } from "../middleware/upload";
import {
  createCategory,
  deleteCategory,
  listAdminMenuItems,
  createMenuItem,
  updateMenuItem,
  updateMenuItemAvailability,
  deleteMenuItem,
  listAdminCombos,
  createCombo,
  updateCombo,
  deleteCombo,
} from "../controllers/admin/menu.controller";
import { listAdminOrders, assignDeliveryAgent } from "../controllers/admin/order.controller";
import { listAgents, createAgent, toggleAgentActive } from "../controllers/admin/agent.controller";
import { getShopConfig, updateShopConfig } from "../controllers/admin/shop-config.controller";
import { listCoupons, createCoupon, toggleCouponActive, deleteCoupon } from "../controllers/admin/coupon.controller";
import { listCustomers, getCustomer, toggleCustomerBlock } from "../controllers/admin/customer.controller";
import { getAnalytics } from "../controllers/admin/analytics.controller";

const router = Router();
router.use(requireAuth("ADMIN"));

router.post("/categories", createCategory);
router.delete("/categories/:id", deleteCategory);

router.get("/menu-items", listAdminMenuItems);
router.post("/menu-items", uploadImage.single("image"), createMenuItem);
router.patch("/menu-items/:id/availability", updateMenuItemAvailability);
router.patch("/menu-items/:id", uploadImage.single("image"), updateMenuItem);
router.delete("/menu-items/:id", deleteMenuItem);

router.get("/combos", listAdminCombos);
router.post("/combos", uploadImage.single("image"), createCombo);
router.patch("/combos/:id", uploadImage.single("image"), updateCombo);
router.delete("/combos/:id", deleteCombo);

router.get("/orders", listAdminOrders);
router.patch("/orders/:id/assign-agent", assignDeliveryAgent);

router.get("/agents", listAgents);
router.post("/agents", createAgent);
router.patch("/agents/:id/active", toggleAgentActive);

router.get("/shop-config", getShopConfig);
router.patch("/shop-config", updateShopConfig);

router.get("/coupons", listCoupons);
router.post("/coupons", createCoupon);
router.patch("/coupons/:id", toggleCouponActive);
router.delete("/coupons/:id", deleteCoupon);

router.get("/customers", listCustomers);
router.get("/customers/:id", getCustomer);
router.patch("/customers/:id/block", toggleCustomerBlock);

router.get("/analytics", getAnalytics);

export default router;
