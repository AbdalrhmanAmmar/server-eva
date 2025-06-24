// controllers/userController.js
import axios from "axios";
import crypto from "crypto";
import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../models/userModel.js";
import { sendToken } from "../utils/sendToken.js";





export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { phone } = req.body;

  if (!phone) {
    return next(new ErrorHandler("Phone number is required", 400));
  }

const user = await User.findOne({ phone });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const smsMessage = `رمز إعادة تعيين كلمة المرور هو: ${resetToken}`;
  const encodedMessage = encodeURIComponent(smsMessage);
  const smsURL = `https://www.dreams.sa/index.php/api/sendsms/?user=Eva_RealEstate&secret_key=${process.env.DREAMS_SECRET_KEY}&sender=Eva%20Aqar&to=${phone}&message=${encodedMessage}`;

  try {
    await axios.get(smsURL);
    res.status(200).json({
      success: true,
      message: `Reset code sent to ${phone}`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Failed to send SMS", 500));
  }
});

// Reset Password - التحقق من الرمز وتحديث كلمة المرور
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { phone, token, newPassword } = req.body;

  if (!phone || !token || !newPassword) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    phone,
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Invalid or expired reset token", 400));
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// Register with SMS
export const register = catchAsyncError(async (req, res, next) => {
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    return next(new ErrorHandler("All fields are required.", 400));
  }

  // ✅ بدون +
  const phoneRegex = /^966\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return next(new ErrorHandler("Invalid phone number.", 400));
  }

  const existingUser = await User.findOne({ phone, accountVerified: true });
  if (existingUser) {
    return next(new ErrorHandler("Phone number already used.", 400));
  }

  const previousAttempts = await User.find({ phone, accountVerified: false });
  if (previousAttempts.length >= 3) {
    return next(new ErrorHandler("Too many attempts. Try again later.", 400));
  }

  // ✅ أنشئ المستخدم وأضف رمز التفعيل قبل الحفظ
  const user = new User({ name, phone, password });
  const verificationCode = user.generateVerificationCode();
  await user.save();

  console.log("✅ User saved to DB:", user); // تتبع للتأكد

  // إعداد الرسالة
  const smsMessage = `مرحباً بك في إيفا العقارية. رمز التفعيل: ${verificationCode}`;
  const encodedMessage = encodeURIComponent(smsMessage);

  const smsURL = `https://www.dreams.sa/index.php/api/sendsms/?user=Eva_RealEstate&secret_key=${process.env.DREAMS_SECRET_KEY}&sender=Eva%20Aqar&to=${phone}&message=${encodedMessage}`;

  try {
    await axios.get(smsURL);
    res.status(200).json({ success: true, message: `Verification SMS sent to ${phone}` });
  } catch (err) {
    return next(new ErrorHandler("Failed to send verification SMS.", 500));
  }
});


// Verify OTP
export const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { otp, phone } = req.body;

  const user = await User.findOne({ phone, accountVerified: false }).sort({ createdAt: -1 });
  if (!user) return next(new ErrorHandler("User not found or already verified.", 404));

  if (user.verificationCode !== Number(otp)) {
    return next(new ErrorHandler("Invalid OTP.", 400));
  }

  if (Date.now() > new Date(user.verificationCodeExpire).getTime()) {
    return next(new ErrorHandler("OTP expired.", 400));
  }

  user.accountVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpire = null;
  await user.save({ validateModifiedOnly: true });

  sendToken(user, 200, "Account Verified.", res);
});

// Login
export const login = catchAsyncError(async (req, res, next) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return next(new ErrorHandler("Phone and password are required.", 400));
  }

  const user = await User.findOne({ phone, accountVerified: true }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid phone or password.", 400));

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return next(new ErrorHandler("Invalid phone or password.", 400));

  sendToken(user, 200, "Logged in successfully.", res);
});

// Logout
export const logout = catchAsyncError(async (req, res, next) => {
  res.status(200).cookie("token", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
  }).json({
    success: true,
    message: "Logged out successfully.",
  });
});

// Get logged-in user info
export const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

