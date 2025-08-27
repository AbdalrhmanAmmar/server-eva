import express from "express";
import {
  createEngineeringPlan,
  getAllEngineeringPlans,
  getEngineeringPlanById,
  updateEngineeringPlanStatus,

} from "../../controller/servicesformController/engineeringPlanController.js";
import { upload } from "../../middleware/upload.js";


const router = express.Router();


router.post(
  "/",
  upload.fields([
    { name: "ownerId", maxCount: 1 },
    { name: "ownershipDoc", maxCount: 1 },
  ]),
  createEngineeringPlan
);


router.get("/", getAllEngineeringPlans)
router.get("/:id", getEngineeringPlanById);
router.patch("/:id/status", updateEngineeringPlanStatus);


export default router;
