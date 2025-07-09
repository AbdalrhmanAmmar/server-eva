import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controller/serviceController.js";

import { isAuthenticated } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// 🟢 إنشاء خدمة جديدة - فقط للأدمن
router.post("/",  createService);

// 🟢 جلب جميع الخدمات
router.get("/", getAllServices);

// 🟢 جلب خدمة واحدة بالتفصيل
router.get("/:id", getServiceById);

// 🟠 تحديث خدمة - فقط للأدمن
router.put("/:id", isAuthenticated, isAdmin, updateService);

// 🔴 حذف خدمة - فقط للأدمن
router.delete("/:id", isAuthenticated, isAdmin, deleteService);

export default router;
