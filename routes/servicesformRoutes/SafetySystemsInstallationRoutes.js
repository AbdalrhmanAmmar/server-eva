import express from "express";
import { 
  createSafetySystemsInstallation, 
  getAllSafetySystemsInstallations, 
  updateSafetyStatus
} from "../../controller/servicesformController/SafetySystemsInstallationController.js";
import { upload } from "../../middleware/upload.js";

const router = express.Router();

 // لتحليل form-data

// POST - إنشاء طلب جديد
router.post(
  "/",
  upload.fields([
    { name: "safetyPlanFile", maxCount: 1 },
  ]),
  createSafetySystemsInstallation
);

// GET - الحصول على كل الطلبات
router.get("/", getAllSafetySystemsInstallations);
router.patch("/:id/status", updateSafetyStatus);

export default router;
