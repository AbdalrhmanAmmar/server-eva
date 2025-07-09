import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// ✅ مخطط العناوين (يمكن تخزين أكثر من عنوان)
const addressSchema = new mongoose.Schema({
  country: String,
  city: String,
  fullAddress: String,
});

// ✅ سكيما المستخدم
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [false, "Email is required"],
    unique: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },

  // ✅ نوع الكيان: فرد، مؤسسة، شركة
  entityType: {
    type: String,
    enum: ["individual", "organization", "company"],
    default: "individual",
    required: true,
  },
  entityName: {
    type: String,
    required: function () {
      return this.entityType !== "individual";
    },
  },
  accountRole: {
    type: String,
    enum: ["owner", "employee"],
    required: function () {
      return this.entityType !== "individual";
    },
  },
  jobTitle: {
    type: String,
    required: function () {
      return this.accountRole === "employee";
    },
  },

  // ✅ العناوين
  addresses: [addressSchema],

  // ✅ معلومات السجل التجاري والضريبة والعنوان الوطني (لغير الأفراد)
  commercialRecordNumber: {
    type: String,
    required: function () {
      return this.entityType !== "individual";
    },
  },
  commercialRecordFile: {
    type: String, // URL للملف
  },
  taxNumber: {
    type: String,
    required: function () {
      return this.entityType !== "individual";
    },
  },
  taxFile: {
    type: String,
  },
  nationalAddressNumber: {
    type: String,
    required: function () {
      return this.entityType !== "individual";
    },
  },
  nationalAddressFile: {
    type: String,
  },

  // ✅ بيانات الدخول
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [8, "Password must have at least 8 characters."],
    maxLength: [128, "Password cannot have more than 128 characters."],
    select: false,
  },
  hasLoggedIn: {
    type: Boolean,
    default: false,
  },

  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    default: "user",
  },
  points: {
    type: Number,
    default: 0,
    min: 0,
  },
  accountVerified: {
    type: Boolean,
    default: false,
  },

  // ✅ أكواد التحقق واستعادة كلمة المرور
  verificationCode: Number,
  verificationCodeExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ تشفير كلمة المرور قبل الحفظ
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ مقارنة كلمة المرور
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ توليد كود تحقق (OTP)
userSchema.methods.generateVerificationCode = function () {
  const otp = 123456; // يمكنك تغييره لاحقًا
  this.verificationCode = otp;
  this.verificationCodeExpire = Date.now() + 5 * 60 * 1000;
  return otp;
};

// ✅ كود إعادة تعيين كلمة المرور
userSchema.methods.generateResetPasswordToken = function () {
  const otp = Math.floor(100000 + Math.random() * 900000);
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 5 * 60 * 1000;
  return otp;
};

// ✅ JWT
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export const User = mongoose.model("User", userSchema);
