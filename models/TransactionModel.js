import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SafetyRequest", // يربط الترانزكشن بالطلب
      required: true,
    },
    transactionId: {
      type: String, // رقم العملية من Geidea
      required: true,
      unique: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "SAR", // تقدر تغير حسب البلد
    },
    status: {
      type: String,
      enum: ["initiated", "pending", "success", "failed", "refunded"],
      default: "initiated",
    },
    paymentMethod: {
      type: String, // مثال: "CARD", "ApplePay", "MeezaQR"
    },
    rawResponse: {
      type: Object, // نخزن الرد الكامل من Geidea للرجوع له وقت الحاجة
    },
  },
  { timestamps: true }
);

const TransactionModel = mongoose.model("Transaction", TransactionSchema);

export default TransactionModel;
