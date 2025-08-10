// controllers/pointsPackageController.js
import {PointsPackage} from "../models/ProductModel.js";
import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";

// إنشاء عرض جديد للنقاط
export const createPointsPackage = catchAsyncError(async (req, res, next) => {
  const { pointsAmount, price } = req.body;

  if (!pointsAmount || !price) {
    return next(new ErrorHandler("pointsAmount and price are required.", 400));
  }

  const newPackage = await PointsPackage.create({ pointsAmount, price });

  res.status(201).json({
    success: true,
    message: "Points package created successfully",
    data: newPackage,
  });
});

// تعديل عرض نقاط موجود
export const updatePointsPackage = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { pointsAmount, price } = req.body;

  const packageToUpdate = await PointsPackage.findById(id);
  if (!packageToUpdate) {
    return next(new ErrorHandler("Points package not found.", 404));
  }

  if (pointsAmount !== undefined) packageToUpdate.pointsAmount = pointsAmount;
  if (price !== undefined) packageToUpdate.price = price;

  await packageToUpdate.save();

  res.status(200).json({
    success: true,
    message: "Points package updated successfully",
    data: packageToUpdate,
  });
});

// حذف عرض نقاط
export const deletePointsPackage = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const packageToDelete = await PointsPackage.findById(id);
  if (!packageToDelete) {
    return next(new ErrorHandler("Points package not found.", 404));
  }

  await packageToDelete.deleteOne();

  res.status(200).json({
    success: true,
    message: "Points package deleted successfully",
  });
});

// جلب كل عروض النقاط المتاحة (للمستخدمين)
export const getAllPointsPackages = catchAsyncError(async (req, res, next) => {
  const packages = await PointsPackage.find({}).sort({ pointsAmount: 1 });

  res.status(200).json({
    success: true,
    data: packages,
  });
});
