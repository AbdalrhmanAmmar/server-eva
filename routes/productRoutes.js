import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductDetails,
} from "../controller/ProductController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductDetails);
router.post(
  "/create",
  isAuthenticated,
  authorizeRoles("admin", "superadmin"),
  createProduct
);

export default router;
