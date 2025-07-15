import express from "express";
import { createInventoryCount } from "../controller/inventoryController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/", isAuthenticated,createInventoryCount); 

export default router;
