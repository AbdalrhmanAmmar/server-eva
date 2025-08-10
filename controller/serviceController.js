import { Service } from "../models/ServiceModel.js";
import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";

// إنشاء خدمة جديدة
export const createService = catchAsyncError(async (req, res, next) => {
  const { name, description, price, formFields } = req.body;
  const image = req.body.image; // لو بترفع الصورة برابط Cloudinary
  const adminId = req.user._id; // معرف الأدمن المسجل

  if (!title || !price) {
    return next(new ErrorHandler("العنوان والسعر مطلوبان", 400));
  }

  const service = await Service.create({
    name,
    description,
    price,
    image,
    formFields,
    createdBy: adminId,
  });

  res.status(201).json({
    success: true,
    message: "تم إنشاء الخدمة بنجاح",
    data: service,
  });
});

// جلب جميع الخدمات
export const getAllServices = catchAsyncError(async (req, res, next) => {
  const services = await Service.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: services.length,
    data: services,
  });
});

// جلب خدمة واحدة بالتفصيل
export const getServiceById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const service = await Service.findById(id);

  if (!service) {
    return next(new ErrorHandler("الخدمة غير موجودة", 404));
  }

  res.status(200).json({
    success: true,
    data: service,
  });
});

// تعديل خدمة
export const updateService = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, price, image, formFields } = req.body;

  const service = await Service.findById(id);
  if (!service) {
    return next(new ErrorHandler("الخدمة غير موجودة", 404));
  }

  service.title = title || service.title;
  service.description = description || service.description;
  service.price = price ?? service.price;
  service.image = image || service.image;
  service.formFields = formFields || service.formFields;

  await service.save();

  res.status(200).json({
    success: true,
    message: "تم تحديث الخدمة بنجاح",
    data: service,
  });
});

// حذف خدمة
export const deleteService = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const service = await Service.findById(id);
  if (!service) {
    return next(new ErrorHandler("الخدمة غير موجودة", 404));
  }

  await service.deleteOne();

  res.status(200).json({
    success: true,
    message: "تم حذف الخدمة بنجاح",
  });
});
