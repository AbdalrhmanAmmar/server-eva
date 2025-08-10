import express from "express";
import { createInventoryCount, getInventoryCountById, getInventoryCountsByUser } from "../controller/inventoryController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/",isAuthenticated,createInventoryCount); 
router.get("/",isAuthenticated,getInventoryCountsByUser); 
router.get("/:id", isAuthenticated, getInventoryCountById);


export default router;
