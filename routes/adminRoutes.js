import express from "express";
import {
  getAllUsers,
} from "../controller/userController.js";

import { isAuthenticated } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { getUserDetails } from "../controller/adminController.js";

const router = express.Router();

router.get("/users",  getAllUsers); // ✅
router.get("/users/:id",  getUserDetails);


export default router;
