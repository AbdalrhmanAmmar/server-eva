import { Product } from "../models/productModel.js";
import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";

// إضافة منتج (admin only)
export const createProduct = catchAsyncError(async (req, res, next) => {
  const { name, description, price, image, category } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    image,
    category,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    product,
  });
});

// عرض كل المنتجات
export const getAllProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json({
    success: true,
    products,
  });
});

// عرض منتج واحد
export const getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  res.status(200).json({
    success: true,
    product,
  });
});
