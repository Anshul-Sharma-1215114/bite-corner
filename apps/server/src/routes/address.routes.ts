import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listAddresses, createAddress, updateAddress, deleteAddress } from "../controllers/address.controller";

const router = Router();
router.use(requireAuth("CUSTOMER"));

router.get("/", listAddresses);
router.post("/", createAddress);
router.patch("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;
