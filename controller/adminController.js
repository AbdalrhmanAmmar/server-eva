// controllers/adminController.js
import { User } from "../models/userModel.js";
import  Product  from "../models/ProductModel.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import review from "../models/reviewModel.js";


export const getUserDetails = catchAsyncError(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId).select("-password");
  if (!user) return next(new ErrorHandler("User not found", 404));

  // جلب المنتجات التي اشتراها (افترض أن لديك حقل `boughtBy` في المنتج)
  const products = await Product.find({ boughtBy: userId });

  // جلب المراجعات التي كتبها
  consts = await review.find({ user: userId }).populate("product", "name");

  res.status(200).json({
    success: true,
    user,
    products,
    reviews,
  });
});

export const updateUser = catchAsyncError(async (req, res, next) => {
  const userId = req.params.id;

  // لو فيه عنوان جديد يتم إضافته للمصفوفة
  if (req.body.address) {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { addresses: req.body.address } },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Address added successfully",
      user: updatedUser,
    });
  }

  // باقي التعديلات العادية
  const updates = req.body;
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});



export const verifyEntityData = catchAsyncError(async (req, res, next) => {
  const { id } = req.params; // ✅ استخدم id بدلاً من userId
  const { action } = req.body; // "approve" or "reject"

  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  if (!["organization", "company"].includes(user.entityType)) {
    return next(new ErrorHandler("User is not an organization or company", 400));
  }

  if (user.verificationStatus !== "pending") {
    return next(new ErrorHandler("لا يمكن تعديل حالة تحقق مكتملة أو مرفوضة", 400));
  }

  if (action === "approve") {
    user.verificationStatus = "approved";
  } else if (action === "reject") {
    user.verificationStatus = "rejected";
  } else {
    return next(new ErrorHandler("Invalid action. Use 'approve' or 'reject'", 400));
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: `تم ${action === "approve" ? "الموافقة على" : "رفض"} بيانات المستخدم`,
    user,
  });
});

