import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getAllProducts, 
  getProductById,
  getProductsByCategory ,
} from "../controller/ProductController.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { getWarehouseById } from "../controller/warehouseController.js";

const router = express.Router();

// Admin routes
router.post(
  "/",

  upload.array("images", 3), 
  createProduct
);

router.patch(
  "/:id",
  upload.array("images", 3), 
  updateProduct
);

router.delete(
  "/:id",

  deleteProduct
);

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getWarehouseById);

router.get("/category/:category", getProductsByCategory); // إضافة روت جديد للتصنيفات
router.get("/:id", getProductById);

export default router;