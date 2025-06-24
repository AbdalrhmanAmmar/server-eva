// routes/userRoutes.js
import express from "express";
import {
  register,
  verifyOTP,
  login,
  logout,
  getUser,
  forgotPassword,
  resetPassword,
} from "../controller/userController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/user/register
router.post("/register", register);

// @route   POST /api/user/verify-otp
router.post("/verify-otp", verifyOTP);

// @route   POST /api/user/login
router.post("/login", login);

// @route   GET /api/user/logout
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// @route   GET /api/user/me
router.get("/me", isAuthenticated, getUser);

export default router;
