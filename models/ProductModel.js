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


images: [
  {
    url: { type: String, required: true },
    isMain: { type: Boolean, default: false },
  }
],

  category: {
    type: String,
  },
  tag: {
    type: String,
  },
  showTag:{
    type:Boolean,
    default:false

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
  warehouse: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Warehouse",
  required: true,
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

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
