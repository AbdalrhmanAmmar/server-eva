import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
  },
  description: {
    type: String,
  },
  priceBeforeDiscount: {
    type: Number,
    required: false,  // اختياري
  },
  priceAfterDiscount: {
    type: Number,
    required: [true, "Price after discount is required"],  // مطلوب
  },
  quantity: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    required: false,
  },
  category: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.model("Product", productSchema);
