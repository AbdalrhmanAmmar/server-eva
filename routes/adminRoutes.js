import express from "express";
import {
  getAllUsers,
} from "../controller/userController.js";

import { isAuthenticated } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { getUserDetails, updateUser,verifyEntityData } from "../controller/adminController.js";

const router = express.Router();

router.get("/users",  getAllUsers); // ✅
router.get("/users/:id",  getUserDetails);
router.patch("/users/:id", updateUser);
router.patch("/users/:id/verify", verifyEntityData);



export default router;
