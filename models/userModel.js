import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [8, "Password must have at least 8 characters."],
    maxLength: [128, "Password cannot have more than 128 characters."],
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    default: "user",
  },
  accountVerified: {
    type: Boolean,
    default: false,
  },
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

// ✅ توليد كود التحقق OTP للتفعيل
userSchema.methods.generateVerificationCode = function () {
  const firstDigit = Math.floor(Math.random() * 9) + 1;
  const remainingDigits = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  const otp = parseInt(firstDigit + remainingDigits);

  this.verificationCode = otp;
  this.verificationCodeExpire = Date.now() + 5 * 60 * 1000;

  return otp;
};

userSchema.methods.generateResetPasswordToken = function () {
  const otp = Math.floor(100000 + Math.random() * 900000);

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 5 * 60 * 1000;

  return otp;
};


userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export const User = mongoose.model("User", userSchema);
