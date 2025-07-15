// models/inventoryCountModel.js
import mongoose from "mongoose";

const inventoryCountSchema = new mongoose.Schema({
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
}, {
  timestamps: true,
});

const InventoryCount = mongoose.model("InventoryCount", inventoryCountSchema);
export default InventoryCount;
