// // controllers/reviewController.js
// import { review } from "../models/ReviewModel.js";
// import { Product } from "../models/ProductModel.js";
// import ErrorHandler from "../middleware/error.js";
// import { catchAsyncError } from "../middleware/catchAsyncError.js";
// import mongoose from "mongoose";

// // 🔹 Add Review
// export const addReview = catchAsyncError(async (req, res, next) => {
//   const { productId, rating, comment } = req.body;
//   const userId = req.user._id;

//   if (!mongoose.Types.ObjectId.isValid(productId)) {
//     return next(new ErrorHandler("معرف المنتج غير صالح", 400));
//   }

//   // منع التقييم المكرر
//   const existingReview = await review.findOne({ user: userId, product: productId });
//   if (existingReview) {
//     return next(new ErrorHandler("لقد قمت بتقييم هذا المنتج مسبقًا", 400));
//   }

//   await Review.create({ user: userId, product: productId, rating, comment });

//   // تحديث تقييم المنتج
//   const reviews = await review.find({ product: productId });
//   const averageRating =
//     reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

//   await Product.findByIdAndUpdate(productId, {
//     averageRating,
//     numberOfReviews: reviews.length,
//   });

//   res.status(201).json({ success: true, message: "تمت إضافة المراجعة" });
// });

// // 🔹 Get All Reviews for a Product
// export const getReviewsByProduct = catchAsyncError(async (req, res, next) => {
//   const productId = req.params.productId;

//   if (!mongoose.Types.ObjectId.isValid(productId)) {
//     return next(new ErrorHandler("معرف المنتج غير صالح", 400));
//   }

//   const reviews = await Review.find({ product: productId }).populate("user", "name email");

//   res.status(200).json({
//     success: true,
//     count: reviews.length,
//     reviews,
//   });
// });

// // 🔹 Delete Review
// export const deleteReview = catchAsyncError(async (req, res, next) => {
//   const reviewId = req.params.id;
//   const userId = req.user._id;

//   const review = await review.findById(reviewId);
//   if (!review) {
//     return next(new ErrorHandler("المراجعة غير موجودة", 404));
//   }

//   if (!review.user.equals(userId)) {
//     return next(new ErrorHandler("غير مسموح لك بحذف هذه المراجعة", 403));
//   }

//   await review.deleteOne();

//   // تحديث تقييم المنتج
//   const reviews = await review.find({ product: review.product });
//   const averageRating =
//     reviews.length > 0
//       ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
//       : 0;

//   await Product.findByIdAndUpdate(review.product, {
//     averageRating,
//     numberOfReviews: reviews.length,
//   });

//   res.status(200).json({
//     success: true,
//     message: "تم حذف المراجعة",
//   });
// });

// // 🔹 (اختياري) Edit Review
// export const updateReview = catchAsyncError(async (req, res, next) => {
//   const { rating, comment } = req.body;
//   const reviewId = req.params.id;
//   const userId = req.user._id;

//   const review = await review.findById(reviewId);
//   if (!review) return next(new ErrorHandler("المراجعة غير موجودة", 404));

//   if (!review.user.equals(userId)) {
//     return next(new ErrorHandler("غير مسموح لك بتعديل هذه المراجعة", 403));
//   }

//   review.rating = rating ?? review.rating;
//   review.comment = comment ?? review.comment;
//   await review.save();

//   // تحديث تقييم المنتج
//   const reviews = await Review.find({ product: review.product });
//   const averageRating =
//     reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

//   await Product.findByIdAndUpdate(review.product, {
//     averageRating,
//     numberOfReviews: reviews.length,
//   });

//   res.status(200).json({
//     success: true,
//     message: "تم تعديل المراجعة",
//   });
// });
// // 🔹 Get Average Rating for a Product
// export const getAverageRating = catchAsyncError(async (req, res, next) => {
//   const productId = req.params.productId;

//   if (!mongoose.Types.ObjectId.isValid(productId)) {
//     return next(new ErrorHandler("معرف المنتج غير صالح", 400));
//   }

//   const product = await Product.findById(productId);
//   if (!product) {
//     return next(new ErrorHandler("المنتج غير موجود", 404));
//   }

//   res.status(200).json({
//     success: true,
//     averageRating: product.averageRating,
//     numberOfReviews: product.numberOfReviews,
//   });
// });