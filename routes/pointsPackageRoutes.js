// routes/pointsPackageRoutes.js
import express from "express";



import { createPointsPackage, deletePointsPackage, getAllPointsPackages, updatePointsPackage } from "../controller/pointsPackageController.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/",createPointsPackage);
router.put("/:id",  updatePointsPackage);
router.delete("/:id",  deletePointsPackage);

router.get("/", getAllPointsPackages);

export default router;
