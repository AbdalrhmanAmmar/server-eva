import mongoose from "mongoose";

const RehabilitationFSchema = new mongoose.Schema(
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
    address: {
      type: String,
      required: [true, "العنوان مطلوب"],
    },
    status:{
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

const Rehabilitation = mongoose.model("Rehabilitation", RehabilitationFSchema);
export default Rehabilitation;
