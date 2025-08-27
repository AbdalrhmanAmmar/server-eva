import mongoose from "mongoose";

const engineeringPlanSchema = new mongoose.Schema(
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
    activity: {
      type: String,
      required: [true, "النشاط مطلوب"],
    },
    address: {
      type: String,
      required: [true, "العنوان مطلوب"],
    },
    // نخزن روابط الملفات
    ownerId: {
      type: String, // رابط الملف أو المسار
    },
    ownershipDoc: {
      type: String, // رابط الملف أو المسار
    },
      status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
      }

  },
  { timestamps: true }
);

 const EngineeringPlan = mongoose.model(
  "EngineeringPlan",
  engineeringPlanSchema
);

export default EngineeringPlan
