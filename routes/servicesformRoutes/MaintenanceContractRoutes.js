import express from "express";
import { upload } from "../../middleware/upload.js";
import { createMaintenanceContract, getMaintenanceContractById, getMaintenanceContracts, updateMaintenanceStatus } from "../../controller/servicesformController/MaintenanceContractController.js";

const router = express.Router();

router.use(express.json()); // لتحليل JSON
router.use(express.urlencoded({ extended: true })); // لتحليل form-data

// POST: إنشاء MaintenanceContract جديد مع رفع الملفات
router.post(
  "/",
  upload.fields([
    { name: "maintenanceContract", maxCount: 1 },
    { name: "rentContract", maxCount: 1 },
    { name: "commercialRegisterFile", maxCount: 1 },
    { name: "buildingLicense", maxCount: 1 },
  ]),
  createMaintenanceContract
);

// GET: استرجاع جميع الـ MaintenanceContracts
router.get("/", getMaintenanceContracts);
router.get("/:id", getMaintenanceContractById);
router.patch("/:id/status", updateMaintenanceStatus);

export default router;
