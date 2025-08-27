import mongoose from "mongoose";

const SafetyPlanSchema = new mongoose.Schema(
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
    autocadFile: {
      type: String,
      required: false,
    },
    buildingLicense: {
      type: String,
      required: false,
    },
    ownerId: {
      type: String,
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

const SafetyPlan = mongoose.model("SafetyPlan", SafetyPlanSchema);
export default SafetyPlan;