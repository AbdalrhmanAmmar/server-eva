import { Product } from "../models/productModel.js";
import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";

// إنشاء منتج جديد - للادمن فقط
export const createProduct = catchAsyncError(async (req, res, next) => {
  const { name, description, priceBeforeDiscount, priceAfterDiscount, quantity, points, category } = req.body;

  if (!name || !priceAfterDiscount) {
    return next(new ErrorHandler("Name and price after discount are required", 400));
  }

  // الصورة اسم الملف تم رفعه عبر multer (req.file)
  if (!req.file) {
    return next(new ErrorHandler("Product image is required", 400));
  }

  const product = new Product({
    name,
    description,
    priceBeforeDiscount,
    priceAfterDiscount,
    quantity: quantity || 0,
    points: points || 0,
    category,
    image: req.file.filename,
    createdBy: req.user._id, // من middleware isAuthenticated
  });

  await product.save();

  res.status(201).json({
    success: true,
    product,
  });
});

// جلب جميع المنتجات (مفتوح للجميع)
export const getAllProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find().populate("createdBy", "name phone role");
  res.status(200).json({
    success: true,
    products,
  });
});

// جلب منتج محدد بالـ id
export const getProductById = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("createdBy", "name phone role");

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// تحديث منتج - للادمن فقط
export const updateProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // تحقق إن المستخدم هو صاحب المنتج أو ادمن
  if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new ErrorHandler("You are not authorized to update this product", 403));
  }

  const updates = [
    "name",
    "description",
    "priceBeforeDiscount",
    "priceAfterDiscount",
    "quantity",
    "points",
   
  ];

  updates.forEach(field => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  if (req.file) {
    product.image = req.file.filename;
  }

  await product.save();

  res.status(200).json({
    success: true,
    product,
  });
});


// حذف منتج - للادمن فقط
export const deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});
