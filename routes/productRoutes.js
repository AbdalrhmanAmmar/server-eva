import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { createProduct, updateProduct, deleteProduct, getAllProducts, getProductById } from "../controller/ProductController.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  createProduct
);

router.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  updateProduct
);

router.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  deleteProduct
);

router.get("/", getAllProducts); // متاح للجميع أو حدد حسب الحاجة
router.get("/:id", getProductById);


export default router;
