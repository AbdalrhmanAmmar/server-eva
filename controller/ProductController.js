import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Product } from "../models/ProductModel.js";
import mongoose from "mongoose";

export const createProduct = catchAsyncError(async (req, res, next) => {
  const {
    name,
    description,
    priceBeforeDiscount,
    priceAfterDiscount,
    quantity,
    category,
    tag,
    shortDescription,
    showQuantity = false,
    showReviews = true,
    showDiscount=false,
    showTag=false
  } = req.body;
  const mainImageName = req.body.mainImageName;

  // Validate required fields
  if (!name || !priceBeforeDiscount) {
    return next(new ErrorHandler("Product name and price are required", 400));
  }

  // Validate at least one image is uploaded
  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("At least one product image is required", 400));
  }

  // Create product
  const product = await Product.create({
    name,
    description,
    priceBeforeDiscount,
    priceAfterDiscount: priceAfterDiscount || priceBeforeDiscount,
    quantity: quantity || 0,
    category,
    tag,
    shortDescription,
    showReviews,
    showQuantity,
    showDiscount,
    showTag,
    images: req.files.map(file => ({
  url: file.filename,
  isMain: file.filename === mainImageName, // فقط الصورة المطابقة تصبح رئيسية
})),

  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});


export const getAllProducts = catchAsyncError(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Filtering
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.tag) filter.tag = req.query.tag;
  if (req.query.minPrice) filter.priceAfterDiscount = { $gte: Number(req.query.minPrice) };
  if (req.query.maxPrice) filter.priceAfterDiscount = { ...filter.priceAfterDiscount, $lte: Number(req.query.maxPrice) };

  // Sorting
  const sort = {};
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1; // Default sort by newest
  }

  // Search
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { shortDescription: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    products,
  });
});


export const getProductById = catchAsyncError(async (req, res, next) => {
  // 1. التحقق من صحة الـ ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorHandler('معرف المنتج غير صالح', 400));
  }

  // 2. البحث عن المنتج مع البيانات المرتبطة
  const product = await Product.findById(req.params.id)
    .populate("createdBy", "name email")

    .lean(); // تحويل إلى object عادي

  // 3. التحقق من وجود المنتج
  if (!product) {
    return next(new ErrorHandler("لم يتم العثور على المنتج", 404));
  }

  // 4. تحويل _id إلى id وإزالة الحقول غير الضرورية
  const transformedProduct = {
    ...product,
    id: product._id.toString(),
    _id: undefined,
    __v: undefined
  };

  // 5. إرسال الاستجابة
  res.status(200).json({
    success: true,
    product: transformedProduct
  });
});


export const updateProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

    const mainImageName = req.body.mainImageName;

  const updatableFields = [
    "name",
    "description",
    "priceBeforeDiscount",
    "priceAfterDiscount",
    "quantity",
    "category",
    "tag",
    "shortDescription",
    "showReviews",
    "showQuantity",
    "showDiscount",
    "showTag",
  ];

  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  // Handle images update
  if (req.files && req.files.length > 0) {
    product.images = req.files.map(file => ({
      url: file.filename,
      isMain: file.filename === mainImageName,
    }));
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product,
  });
});

/**
 * @desc    Delete product (Admin only)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
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

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public
 */
export const getProductsByCategory = catchAsyncError(async (req, res, next) => {
  const products = await Product.find({ category: req.params.category })
    .populate("createdBy", "name");

  if (!products || products.length === 0) {
    return next(new ErrorHandler(`No products found in category ${req.params.category}`, 404));
  }

  res.status(200).json({
    success: true,
    count: products.length,
    products,
  });
});