import mongoose from "mongoose";

const SafetySystemsInstallationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "الاسم مطلوب"],
      trim: true,
      minlength: 2,
    },
    phone: {
      type: String,
      required: [true, "رقم الهاتف مطلوب"],
      minlength: 9,
    },
    safetyPlanFile: {
      type: String, // مسار الملف
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

  },
  { timestamps: true }
);

const SafetySystemsInstallation = mongoose.model(
  "SafetySystemsInstallation",
  SafetySystemsInstallationSchema
);

export default SafetySystemsInstallation;
