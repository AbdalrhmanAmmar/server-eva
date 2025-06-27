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

  const smsMessage = `لقد تم طلب إعادة تعيين كلمة المرور لحسابك لدى شركة إيفاء العقارية.
رمز التحقق هو: ${resetToken}
أدخل الرمز خلال 5 دقائق لإكمال العملية.
إذا لم تطلب ذلك، تجاهل هذه الرسالة.`;

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
export const sendOTP = catchAsyncError(async (req, res, next) => {
  const { phone } = req.body;
  if (!phone) return next(new ErrorHandler("Phone number is required.", 400));

  const phoneRegex = /^966\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return next(new ErrorHandler("Invalid phone number.", 400));
  }

  // تحقق هل الرقم مسجل ومفعل بالفعل
  const existingUser = await User.findOne({ phone, accountVerified: true });
  if (existingUser) {
    return next(new ErrorHandler("Phone number already in use.", 400));
  }

  // ابحث عن مستخدم غير مفعل بنفس الرقم (حاول إعادة الإرسال)
  let user = await User.findOne({ phone, accountVerified: false });

  if (!user) {
    // إنشاء مستخدم جديد (بدون اسم وكلمة مرور بعد)
    user = new User({ phone });
  }

  // توليد رمز تحقق جديد
  const verificationCode = user.generateVerificationCode();
  await user.save({ validateBeforeSave: false });

  // رسالة الـ SMS
  const smsMessage = `رمز التحقق الخاص بك لدى شركة إيفاء العقارية هو: ${verificationCode}
يُرجى عدم مشاركة هذا الرمز مع أي جهة.
صلاحية الرمز: 5 دقائق.`;

  const encodedMessage = encodeURIComponent(smsMessage);
  const smsURL = `https://www.dreams.sa/index.php/api/sendsms/?user=Eva_RealEstate&secret_key=${process.env.DREAMS_SECRET_KEY}&sender=Eva%20Aqar&to=${phone}&message=${encodedMessage}`;

  try {
    await axios.get(smsURL);
res.status(200).json({
  success: true,
  message: `Verification SMS sent to ${phone}`,
  data: {
    otpId: user._id.toString(),                  // معرف المستخدم كـ OTP ID
    expiresAt: user.verificationCodeExpire,     // وقت انتهاء صلاحية رمز التحقق
  },
});
  } catch (err) {
    return next(new ErrorHandler("Failed to send verification SMS.", 500));
  }
});

// التحقق من OTP واستكمال التسجيل (خطوة 2)
export const verifyOTPAndCompleteRegistration = catchAsyncError(async (req, res, next) => {
  const { otpId, otp, name, password } = req.body;

  // 1. التحقق من الحقول المطلوبة
  if (!otpId || !otp || !name || !password) {
    return next(new ErrorHandler("جميع الحقول مطلوبة", 400));
  }

  // 2. جلب المستخدم مع إعادة تحميل جميع التوابع (مهم جداً)
  const user = await User.findById(otpId).select("+password");
  if (!user || user.accountVerified) {
    return next(new ErrorHandler("المستخدم غير موجود أو مفعل مسبقاً", 404));
  }

  // 3. التحقق من صحة OTP
  if (user.verificationCode !== Number(otp)) {
    return next(new ErrorHandler("كود التحقق غير صحيح", 400));
  }

  if (Date.now() > user.verificationCodeExpire.getTime()) {
    return next(new ErrorHandler("انتهت صلاحية كود التحقق", 400));
  }

  // 4. تحديث البيانات
  user.name = name;
  user.password = password; // سيتم تشفيرها تلقائياً بواسطة pre('save')
  user.accountVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpire = undefined;

  // 5. الحفظ ثم إعادة التحميل (حل سحري)
  await user.save({ validateBeforeSave: false });
  const freshUser = await User.findById(user._id);

  // 6. توليد التوكن من النسخة الجديدة
  const token = freshUser.generateToken();

  // 7. إرسال الاستجابة بدون كلمة المرور
  freshUser.password = undefined;

  res.status(200).json({
    success: true,
    message: "تم تفعيل الحساب بنجاح",
    data: {
      user: {
        id: freshUser._id,
        name: freshUser.name,
        phone: freshUser.phone,
        role: freshUser.role,
      },
      token,
    },
  });
});

export const verifyOTPOnly = catchAsyncError(async (req, res, next) => {
  const { otpId, otp } = req.body;

  if (!otpId || !otp) {
    return next(new ErrorHandler("otpId and OTP are required.", 400));
  }

  const user = await User.findById(otpId);
  if (!user || user.accountVerified) {
    return next(new ErrorHandler("User not found or already verified.", 404));
  }

  if (user.verificationCode !== Number(otp)) {
    return next(new ErrorHandler("Invalid OTP.", 400));
  }

  if (Date.now() > new Date(user.verificationCodeExpire).getTime()) {
    return next(new ErrorHandler("OTP expired.", 400));
  }

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });
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

  // توليد التوكن
  const token = user.generateToken();

  // إرسال الرد مع بيانات المستخدم كاملة
  res.status(200).cookie("token", token, {
    httpOnly: true,
    // باقي خيارات الكوكي حسب الحاجة
  }).json({
    success: true,
    message: "Logged in successfully.",
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,  // تأكد هنا ترسل الـ role
    },
    token,
  });
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

