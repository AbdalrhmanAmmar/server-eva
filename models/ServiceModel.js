import mongoose from "mongoose";

// سكيمة الحقول التي سيملأها المستخدم عند شراء الخدمة
const formFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // اسم الحقل الذي يظهر للمستخدم (مثلاً: الاسم الكامل)
  },
  type: {
    type: String,
    required: true,
    enum: [
      "text",
      "textarea",
      "number",
      "select",
      "radio",
      "checkbox",
      "file",
      "image",
      "date",
    ],
  },
  required: {
    type: Boolean,
    default: false,
  },
  options: {
    type: [String], // في حالة select أو radio
    default: [],
  },
  placeholder: {
    type: String,
  },
  defaultValue: {
    type: mongoose.Schema.Types.Mixed,
  },
});

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  image: {
    type: String, // رابط الصورة بعد الرفع (Cloudinary مثلاً)
  },

  formFields: {
    type: [formFieldSchema],
    default: [],
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Service = mongoose.model("Service", serviceSchema);
