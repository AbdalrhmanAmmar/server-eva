// controllers/userController.js
import axios from "axios";
import crypto from "crypto";
import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../models/userModel.js";
import sendVerificationEmail from "../utils/sendVerificationEmail.js";





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

  const smsMessage = `رمز إعادة تعين كلمة المرور الخاصة بحسابك علي إيفاء العقارية هو ${resetToken} والذي سيكون صالح لمدة ٣ دقائق`;

  const encodedMessage = encodeURIComponent(smsMessage);
  const smsURL = `https://www.dreams.sa/index.php/api/sendsms/?user=Eva_RealEstate&secret_key=${process.env.DREAMS_SECRET_KEY}&sender=Eva%20Aqar&to=${phone}&message=${encodedMessage}`;

  try {
    await axios.get(smsURL);
    res.status(200).json({
      success: true,
      message: `Reset code sent to ${phone}`,
      otpId: user._id.toString() // إضافة otpId للاستجابة
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Failed to send SMS", 500));
  }
});

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


export const sendOTP = catchAsyncError(async (req, res, next) => {
  const { phone } = req.body;
  if (!phone) return next(new ErrorHandler("Phone number is required.", 400));

  const phoneRegex = /^966\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return next(new ErrorHandler("Invalid phone number.", 400));
  }

  // 🔎 تحقق: هل الرقم موجود؟
  let user = await User.findOne({ phone });

  if (user) {
    if (user.accountVerified) {
      // لو الرقم مفعل بالفعل → منع التسجيل
      return next(new ErrorHandler("Phone number already in use.", 400));
    }
    // لو لسه مش مفعل → نعيد إرسال OTP
  } else {
    // لو مستخدم جديد → ننشئ حساب مبدئي
    user = new User({ phone });
  }

  // ✅ توليد رمز تحقق جديد
  const verificationCode = user.generateVerificationCode();
  await user.save({ validateBeforeSave: false });

  // ✅ استخدام نص الرسالة الثابت كما طلبت
  const messageText = `مرحبا بكم في ايفاء العقاريه هذا هو كود التفعيل الخاص بكم ارجو عدم مشاركه هذا الكود: ${verificationCode}`;

  const encodedMessage = encodeURIComponent(messageText);
  const smsURL = `https://www.dreams.sa/index.php/api/sendsms/?user=Eva_RealEstate&secret_key=${process.env.DREAMS_SECRET_KEY}&sender=Eva%20Aqar&to=${phone}&message=${encodedMessage}`;

  try {
    // أضف console.log لرؤية الرابط الذي يتم إرساله
    console.log('📤 SMS URL:', smsURL);
    
    const response = await axios.get(smsURL);
    
    // أضف تحقق من الاستجابة
    console.log('📩 SMS API Response:', response.data);
    
    res.status(200).json({
      success: true,
      message: `Verification SMS sent to ${phone}`,
      data: {
        otpId: user._id.toString(),
        expiresAt: user.verificationCodeExpire,
        verificationCode: verificationCode // لأغراض الاختبار فقط
      },
    });
  } catch (err) {
    console.error('❌ SMS Error:', err.response?.data || err.message);
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

  // ✅ تحديث hasLoggedIn إذا لم يكن قد سجل دخول من قبل
  if (!user.hasLoggedIn) {
    user.hasLoggedIn = true;
    await user.save(); // نحفظ التحديث
  }

  // ✅ توليد التوكن
  const token = user.generateToken();

  // ✅ إرسال الرد مع بيانات المستخدم
  res.status(200)
    .cookie("token", token, {
      httpOnly: true,
      // يمكنك إضافة expires، secure... حسب بيئة التشغيل
    })
    .json({
      success: true,
      message: "Logged in successfully.",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
});


// Logout
export const logout = catchAsyncError(async (req, res, next) => {
  // استخرج المستخدم من التوكن أو الطلب
  const token = req.cookies.token;
  console.log(token)

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // حلل التوكن للحصول على الـ id
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // ✨ تحديث حالة الحساب (مثال: hasLoggedIn = false أو isOnline = false)
  user.hasLoggedIn = false;
  await user.save();

  // ✨ حذف التوكن
  res.status(200).cookie("token", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
  }).json({
    success: true,
    message: "Logged out successfully and status updated.",
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

export const verifyResetOTP = catchAsyncError(async (req, res, next) => {
  const { otpId, otp, phone } = req.body;

  if (!otpId || !otp || !phone) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const hashedToken = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await User.findOne({
    _id: otpId,
    phone,
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Invalid or expired OTP", 400));
  }

  // إنشاء توكن جديد فريد لإعادة التعيين
  const newResetToken = crypto.randomBytes(20).toString('hex');
  const hashedResetToken = crypto.createHash("sha256").update(newResetToken).digest("hex");

  // حفظ التوكن الجديد في قاعدة البيانات
  user.resetPasswordToken = hashedResetToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 دقيقة
  await user.save();

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    resetToken: newResetToken, // إرجاع التوكن الجديد (غير مشفر)
  });
});

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find().select("-password"); // بدون كلمات مرور

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

// controllers/userController.js


export const updateUserProfileAfterLogin = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) return next(new ErrorHandler("المستخدم غير موجود", 404));

  const {
    email,
    gender,
    entityType,
    entityName,
    accountRole,
    jobTitle,
    addresses,
    commercialRecordNumber,
    taxNumber,
    nationalAddressNumber,
  } = req.body;

  console.log("📥 البيانات الواردة:", req.body);
  console.log("📁 الملفات المرفوعة:", req.files);

  // ✅ التحقق من حالة pending - السماح فقط بتعديل البريد الإلكتروني
  if (user.verificationStatus === "pending") {
    const allowedUpdates = ['email'];
    const requestKeys = Object.keys(req.body);
    const hasFiles = req.files && Object.keys(req.files).length > 0;
    
    // إذا كان هناك أي تحديث غير البريد الإلكتروني أو ملفات
    const hasDisallowedUpdate = requestKeys.some(key => !allowedUpdates.includes(key)) || hasFiles;
    
    if (hasDisallowedUpdate) {
      return next(new ErrorHandler("❌ لا يمكن تعديل البيانات أثناء انتظار التحقق، مسموح فقط بتعديل البريد الإلكتروني", 403));
    }
  }

  // ✅ التحقق من تغيير البريد الإلكتروني
  if (email && email !== user.email && email !== user.pendingEmail) {
    const code = Math.floor(100000 + Math.random() * 900000); // كود عشوائي
    console.log("🔵 سيتم حفظ الإيميل:", email);
    console.log("🟢 كود التحقق:", code);

    user.pendingEmail = email;
    user.emailVerificationCode = code;
    user.emailVerificationCodeExpire = Date.now() + 5 * 60 * 1000;
    user.emailVerified = false;

    await sendVerificationEmail(email, code);
    console.log("📨 تم إرسال كود التحقق:", code);
  }

  // ✅ تحديث البيانات العامة
  if (gender) user.gender = gender;

  // ✅ التحقق من نوع الكيان
  if (entityType && entityType !== user.entityType) {
    const hierarchy = { individual: 1, organization: 2, company: 3 };
    if (hierarchy[entityType] < hierarchy[user.entityType]) {
      return next(new ErrorHandler("لا يمكن الرجوع إلى نوع كيان أدنى", 400));
    }
    user.previousEntityType = user.entityType;
    user.entityType = entityType;
  }

  // ✅ معالجة الكيانات غير الفردية
  if (user.entityType !== "individual") {
    const sensitiveFieldsChanged = (
      (entityName && entityName !== user.entityName) ||
      (accountRole && accountRole !== user.accountRole) ||
      (jobTitle && jobTitle !== user.jobTitle) ||
      (commercialRecordNumber && commercialRecordNumber !== user.commercialRecordNumber) ||
      (taxNumber && taxNumber !== user.taxNumber) ||
      (nationalAddressNumber && nationalAddressNumber !== user.nationalAddressNumber) ||
      req.files?.commercialRecordFile?.[0] ||
      req.files?.taxFile?.[0] ||
      req.files?.nationalAddressFile?.[0]
    );

    if (sensitiveFieldsChanged) {
      user.verificationStatus = "pending";
    }

    if (entityName) user.entityName = entityName;
    if (accountRole) user.accountRole = accountRole;
    if (accountRole === "employee" && jobTitle) user.jobTitle = jobTitle;
    if (commercialRecordNumber) user.commercialRecordNumber = commercialRecordNumber;
    if (taxNumber) user.taxNumber = taxNumber;
    if (nationalAddressNumber) user.nationalAddressNumber = nationalAddressNumber;

    // ✅ رفع ملفات مع التحقق
    const handleFileUpload = (file, fieldName) => {
      if (file?.[0]) {
        // حذف الملف القديم إذا موجود
        if (user[fieldName]) {
          const oldFilePath = path.join(__dirname, '..', '..', user[fieldName]);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        user[fieldName] = `/uploads/${file[0].filename}`;
        console.log(`✅ ${fieldName} محفوظ:`, user[fieldName]);
      }
    };

    handleFileUpload(req.files?.commercialRecordFile, 'commercialRecordFile');
    handleFileUpload(req.files?.taxFile, 'taxFile');
    handleFileUpload(req.files?.nationalAddressFile, 'nationalAddressFile');
  }

  // ✅ معالجة العناوين
  if (req.body.addresses) {
    try {
      const addressesData = typeof req.body.addresses === 'string'
        ? JSON.parse(req.body.addresses)
        : req.body.addresses;

      if (!Array.isArray(addressesData)) {
        return next(new ErrorHandler("تنسيق العناوين غير صحيح - يجب أن تكون مصفوفة", 400));
      }

      user.addresses = addressesData.map(addr => ({
        country: addr.country?.trim() || '',
        city: addr.city?.trim() || '',
        district: addr.district?.trim() || '',
        street: addr.street?.trim() || '',
        buildingNumber: addr.buildingNumber?.trim() || '',
        unitNumber: addr.unitNumber?.trim() || '',
        apartmentNumber: addr.apartmentNumber?.trim() || '',
        postalCode: addr.postalCode?.trim() || '',
        addressDetails: addr.addressDetails?.trim() || '',
        isDefault: addr.isDefault || false
      }));

      const defaultAddresses = user.addresses.filter(addr => addr.isDefault);
      if (defaultAddresses.length > 1) {
        return next(new ErrorHandler("يجب تحديد عنوان افتراضي واحد فقط", 400));
      }
    } catch (err) {
      console.error('❌ خطأ في معالجة العناوين:', err);
      return next(new ErrorHandler("تنسيق العناوين غير صحيح", 400));
    }
  }

  // ✅ حفظ التعديلات
  try {
    await user.save();
    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: "تم تحديث الملف الشخصي بنجاح",
      user: updatedUser,
      verificationStatus: updatedUser.verificationStatus,
      pendingEmail: updatedUser.pendingEmail || null
    });

  } catch (saveError) {
    console.error('❌ خطأ في حفظ البيانات:', saveError);
    return next(new ErrorHandler("حدث خطأ أثناء حفظ البيانات", 500));
  }
});

export const verifyEmailCode = catchAsyncError(async (req, res, next) => {
  const { userId, code } = req.body;

  const user = await User.findById(userId);
  if (!user) return next(new ErrorHandler("المستخدم غير موجود", 404));
console.log("🟡 الكود من المستخدم:", code);
console.log("🟢 الكود في قاعدة البيانات:", user.emailVerificationCode);
console.log("🕐 الوقت الحالي:", Date.now());
console.log("📅 انتهاء صلاحية الكود:", user.emailVerificationCodeExpire);
console.log("📧 pendingEmail:", user.pendingEmail);

  if (
    !user.pendingEmail ||
    user.emailVerificationCode !== Number(code) ||
    Date.now() > user.emailVerificationCodeExpire
  ) {
    return next(new ErrorHandler("رمز التحقق غير صحيح أو منتهي", 400));
  }

  user.email = user.pendingEmail;
  user.pendingEmail = undefined;
  user.emailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationCodeExpire = undefined;

  await user.save();
console.log("📬 بعد الحفظ - pendingEmail:", user.pendingEmail);
console.log("📬 بعد الحفظ - code:", user.emailVerificationCode);


  res.status(200).json({
    success: true,
    message: "✅ تم تأكيد البريد الإلكتروني",
  });
});
