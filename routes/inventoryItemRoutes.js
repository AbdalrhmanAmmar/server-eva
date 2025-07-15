// routes/inventoryItemRoute.js
import express from "express";
import { createInventoryItem } from "../controller/inventoryItemController.js";
const router = express.Router();

router.post("/", createInventoryItem);

export default router;
