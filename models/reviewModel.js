// models/ReviewModel.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // أو "Client" حسب نوع المستخدم عندك
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true, // لتوليد createdAt و updatedAt تلقائيًا
  }
);

export const review = mongoose.model("Review", reviewSchema);
