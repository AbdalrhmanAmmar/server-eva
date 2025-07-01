import mongoose from "mongoose";

const pointsPackageSchema = new mongoose.Schema({
  pointsAmount: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  timestamps: true,
});

const PointsPackage = mongoose.model("PointsPackage", pointsPackageSchema);
export default PointsPackage;
