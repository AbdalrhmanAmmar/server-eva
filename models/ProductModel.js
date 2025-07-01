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
    required: [true, "Price before discount is required"],
  },
  priceAfterDiscount: {
    type: Number,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  showQuantity: {
  type: Boolean,
  default: false,
},
showDiscount: {
  type: Boolean,
  default: false,
},


  images: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
  },
  tag: {
    type: String,
  },
  shortDescription: {
    type: String,
  },
  showReviews: {
    type: Boolean,
    default: true,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin", // Assuming you have an Admin model
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.model("Product", productSchema);
