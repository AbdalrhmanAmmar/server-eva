// controllers/adminController.js
import { User } from "../models/userModel.js";
import { Product } from "../models/ProductModel.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import { Review } from "../models/ReviewModel.js";


export const getUserDetails = catchAsyncError(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId).select("-password");
  if (!user) return next(new ErrorHandler("User not found", 404));

  // جلب المنتجات التي اشتراها (افترض أن لديك حقل `boughtBy` في المنتج)
  const products = await Product.find({ boughtBy: userId });

  // جلب المراجعات التي كتبها
  const reviews = await Review.find({ user: userId }).populate("product", "name");

  res.status(200).json({
    success: true,
    user,
    products,
    reviews,
  });
});
