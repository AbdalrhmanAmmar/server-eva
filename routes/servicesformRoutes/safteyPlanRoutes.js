import express from "express";
import { createSafetyPlan, getAllSafetyPlanbyId, getAllSafetyPlans, updateStatusSafetyPlans } from "../../controller/servicesformController/SafetyPlanController.js";
import { upload } from "../../middleware/upload.js";



const router = express.Router();

router.use(express.json()); // لتحليل JSON
router.use(express.urlencoded({ extended: true })); // لتحليل form-data


router.post(
  "/",
  upload.fields([
    { name: "autocadFile", maxCount: 1 },
    { name: "buildingLicense", maxCount: 1 },
    { name: "ownerId", maxCount: 1 },
  ]),
  createSafetyPlan
);

router.get("/", getAllSafetyPlans);
router.get("/:id", getAllSafetyPlanbyId);
router.get("/", getAllSafetyPlanbyId);
router.patch("/:id/status", updateStatusSafetyPlans);

export default router;