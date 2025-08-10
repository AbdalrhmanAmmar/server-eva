import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import Product  from "../models/ProductModel.js";
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
    showDiscount = false,
    showTag = false,
    showProduct = true,
    requiresShipping = true,
    discounts = [],
    showRelatedProduct=false,
    
    // الحقول الأخرى
    sku,
    barcode,
    weight,
    minOrder,
    maxOrder,
    isTaxExempt = false,
    relatedProducts,
    warehouse,
  } = req.body;

  const mainImageName = req.body.mainImageName;

  // ✅ التحقق من الحقول المطلوبة
  if (!name || !priceBeforeDiscount || !warehouse) {
    return next(new ErrorHandler("اسم المنتج، السعر، والمخزن مطلوبة", 400));
  }

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("يجب رفع صورة واحدة على الأقل", 400));
  }

  // التحقق من صحة تواريخ الخصم إذا وجدت
  if (discounts && discounts.length > 0) {
    for (const discount of discounts) {
      if (!discount.startDate || !discount.endDate) {
        return next(new ErrorHandler("يجب تحديد تاريخ بداية ونهاية لكل خصم", 400));
      }
      
      if (new Date(discount.startDate) >= new Date(discount.endDate)) {
        return next(new ErrorHandler("تاريخ بداية الخصم يجب أن يكون قبل تاريخ النهاية", 400));
      }
      
      if (!discount.discountAmount || discount.discountAmount <= 0) {
        return next(new ErrorHandler("يجب تحديد قيمة الخصم وتكون أكبر من الصفر", 400));
      }
      
      if (!['percentage', 'fixed'].includes(discount.discountType)) {
        return next(new ErrorHandler("نوع الخصم يجب أن يكون 'percentage' أو 'fixed'", 400));
      }
    }
  }

  // حساب السعر بعد الخصم إذا لم يتم تحديده
  let finalPriceAfterDiscount = priceAfterDiscount || priceBeforeDiscount;

  // إذا كان هناك خصم نشط، احسب السعر الجديد
  const now = new Date();
  if (discounts && discounts.length > 0) {
    const activeDiscount = discounts.find(d => 
      new Date(d.startDate) <= now && new Date(d.endDate) >= now
    );
    
    if (activeDiscount) {
      if (activeDiscount.discountType === 'percentage') {
        finalPriceAfterDiscount = priceBeforeDiscount * (1 - activeDiscount.discountAmount / 100);
      } else {
        finalPriceAfterDiscount = priceBeforeDiscount - activeDiscount.discountAmount;
      }
      // التأكد من أن السعر بعد الخصم ليس أقل من الصفر
      finalPriceAfterDiscount = Math.max(0, finalPriceAfterDiscount);
    }
  }

  const product = await Product.create({
    name,
    description,
    priceBeforeDiscount,
    priceAfterDiscount: finalPriceAfterDiscount,
    quantity: quantity || 0,
    category,
    tag,
    shortDescription,
    showReviews,
    showQuantity,
    showDiscount: discounts && discounts.some(d => 
      new Date(d.startDate) <= now && new Date(d.endDate) >= now
    ),
    showTag,
    showProduct,
    requiresShipping,
    discounts,
    sku,
    barcode,
    weight,
    minOrder,
    maxOrder,
    isTaxExempt,
    relatedProducts,
    showRelatedProduct,
    warehouse,
    createdBy: req.user?.id || null,
    images: req.files.map(file => ({
      url: file.filename,
      isMain: file.filename === mainImageName,
    })),
  });

  res.status(201).json({
    success: true,
    message: "تم إنشاء المنتج بنجاح",
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
  const now = new Date();

  // الحقول القابلة للتحديث
  const updatableFields = [
    "name",
    "description",
    "priceBeforeDiscount",
    "quantity",
    "category",
    "tag",
    "shortDescription",
    "showReviews",
    "showQuantity",
    "showTag",
    "showProduct",
    "requiresShipping",
    "sku",
    "barcode",
    "showRelatedProduct",
    "weight",
    "minOrder",
    "maxOrder",
    "isTaxExempt",
    "relatedProducts",
    "warehouse",
    "discounts"
  ];

  // تحديث الحقول الأساسية
  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  // معالجة تحديث الصور
  if (req.files && req.files.length > 0) {
    product.images = req.files.map(file => ({
      url: file.filename,
      isMain: file.filename === mainImageName,
    }));
  }

  // التحقق من الخصومات وتحديث السعر وحالة العرض
  if (req.body.discounts !== undefined) {
    // التحقق من صحة الخصومات إذا تم تحديثها
    if (req.body.discounts && req.body.discounts.length > 0) {
      for (const discount of req.body.discounts) {
        if (!discount.startDate || !discount.endDate) {
          return next(new ErrorHandler("يجب تحديد تاريخ بداية ونهاية لكل خصم", 400));
        }
        
        if (new Date(discount.startDate) >= new Date(discount.endDate)) {
          return next(new ErrorHandler("تاريخ بداية الخصم يجب أن يكون قبل تاريخ النهاية", 400));
        }
        
        if (!discount.discountAmount || discount.discountAmount <= 0) {
          return next(new ErrorHandler("يجب تحديد قيمة الخصم وتكون أكبر من الصفر", 400));
        }
        
        if (!['percentage', 'fixed'].includes(discount.discountType)) {
          return next(new ErrorHandler("نوع الخصم يجب أن يكون 'percentage' أو 'fixed'", 400));
        }
      }
    }

    // تحديث حالة العرض بناءً على الخصومات النشطة
    product.showDiscount = product.discounts.some(d => 
      new Date(d.startDate) <= now && new Date(d.endDate) >= now
    );
  }

  // حساب السعر بعد الخصم إذا كان هناك تحديث للسعر الأصلي أو الخصومات
  if (req.body.priceBeforeDiscount !== undefined || req.body.discounts !== undefined) {
    let finalPrice = product.priceBeforeDiscount;
    
    if (product.discounts && product.discounts.length > 0) {
      const activeDiscount = product.discounts.find(d => 
        new Date(d.startDate) <= now && new Date(d.endDate) >= now
      );
      
      if (activeDiscount) {
        if (activeDiscount.discountType === 'percentage') {
          finalPrice = product.priceBeforeDiscount * (1 - activeDiscount.discountAmount / 100);
        } else {
          finalPrice = product.priceBeforeDiscount - activeDiscount.discountAmount;
        }
        finalPrice = Math.max(0, finalPrice);
      }
    }
    
    product.priceAfterDiscount = finalPrice;
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: "تم تحديث المنتج بنجاح",
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

export const getProductsByWarehouse = catchAsyncError(async (req, res, next) => {
  try {
    const { warehouse } = req.params; // ← بدل من req.query

    if (!warehouse) {
      return res.status(400).json({
        success: false,
        message: "رقم المخزن مطلوب",
      });
    }

    const products = await Product.find({ warehouse });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب المنتجات",
      error: error.message,
    });
  }
});
