// models/inventoryCountItemModel.js
import mongoose from "mongoose";

const inventoryCountItemSchema = new mongoose.Schema(
  {
    inventoryCount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryCount",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    systemQuantity: {
      type: Number,
      required: true,
    },
    countedQuantity: {
      type: Number,
      required: true,
    },
    difference: {
      type: Number,
    },
    costPerUnit: {
      type: Number,
      required: true,
    },
    totalDifferenceCost: {
      type: Number,
    },
    isMatched: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// حساب الفرق والتكلفة قبل الحفظ
inventoryCountItemSchema.pre("save", function (next) {
  this.difference = this.countedQuantity - this.systemQuantity;
  this.totalDifferenceCost = this.difference * this.costPerUnit;
  this.isMatched = this.difference === 0;
  next();
});

const InventoryCountItem = mongoose.model("InventoryCountItem", inventoryCountItemSchema);
export default InventoryCountItem;
