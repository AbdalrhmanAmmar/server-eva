import express from "express";
import {
  sendOTP,
  verifyOTPAndCompleteRegistration,
  login,
  logout,
  getUser,
  forgotPassword,
  resetPassword,
  verifyOTPOnly,
  updateUserProfileAfterLogin,
  verifyEmailCode,
} from "../controller/userController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// إرسال OTP لرقم الهاتف (خطوة 1)
router.post("/send-otp", sendOTP);

// التحقق من OTP واستكمال التسجيل (خطوة 2)
router.post("/verify-otp-complete", verifyOTPAndCompleteRegistration);
router.post("/verify-otp-only", verifyOTPOnly);

// تسجيل الدخول
router.post("/login", login);

// تسجيل الخروج
router.post("/logout",isAuthenticated,logout);

// استعادة كلمة المرور
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// الحصول على بيانات المستخدم الحالي (بعد التوثيق)
router.get("/me", isAuthenticated, getUser);
router.post("/verify-email-code", verifyEmailCode);



router.put(
  "/update-profile",
  upload.fields([
    { name: "commercialRecordFile", maxCount: 1 },
    { name: "taxFile", maxCount: 1 },
    { name: "nationalAddressFile", maxCount: 1 },
  ]),
  isAuthenticated,
  updateUserProfileAfterLogin
);


export default router;
