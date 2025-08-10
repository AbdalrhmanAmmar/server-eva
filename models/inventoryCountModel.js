import mongoose from "mongoose";
import { Product } from "./ProductModel.js"; // تأكد من صحة المسار

// عنصر من عناصر الجرد
const inventoryCountItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    countedQuantity: {
      type: Number,
      required: true,
    },

  },
  { _id: false }
);

// سكيمة الجرد الرئيسي
const inventoryCountSchema = new mongoose.Schema(
  {
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    name: {
      type: String,
      required: [true, "اسم الجرد مطلوب"],
    },
    type: {
      type: String,
      enum: ["full", "partial"],
      required: [true, "نوع الجرد مطلوب"],
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "reviewed", "completed"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    items: [inventoryCountItemSchema],
  },
  {
    timestamps: true,
  }
);

const InventoryCount = mongoose.model("InventoryCount", inventoryCountSchema);
export default InventoryCount;
