import express from "express";
import { createInventoryCount, getInventoryCountById, getInventoryCountsByUser } from "../controller/inventoryController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/",createInventoryCount); 
router.get("/",getInventoryCountsByUser); 
router.get("/:id", getInventoryCountById);


export default router;
