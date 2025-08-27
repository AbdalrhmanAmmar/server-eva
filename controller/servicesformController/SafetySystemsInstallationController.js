import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import ErrorHandler from "../../middleware/error.js";
import SafetySystemsInstallation from "../../models/servicesmodel/SafetySystemsInstallation.js";

export const createSafetySystemsInstallation = catchAsyncError(async (req, res, next) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return next(new ErrorHandler("الاسم ورقم الهاتف مطلوبان", 400));
  }

  const files = req.files || {};
  const safetyPlanFile = files.safetyPlanFile?.[0];

  const plan = await SafetySystemsInstallation.create({
    name,
    phone,
    safetyPlanFile: safetyPlanFile ? `/uploads/safety-systems-installation/${safetyPlanFile.filename}` : null,
    createdBy: req.user?._id,
  });

  res.status(201).json({
    success: true,
    message: "تم إنشاء طلب تركيب أنظمة السلامة بنجاح",
    data: plan,
  });
});

export const getAllSafetySystemsInstallations = catchAsyncError(async (req, res, next) => {
  const plans = await SafetySystemsInstallation.find().sort({ createdAt: -1 });

  if (!plans || plans.length === 0) {
    return next(new ErrorHandler("لا توجد طلبات مسجلة", 404));
  }

  res.status(200).json({
    success: true,
    data: plans,
  });
});

export const updateSafetyStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return next(new ErrorHandler("حالة الطلب مطلوبة", 400));
  }

  const validStatuses = ["pending", "completed"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler("حالة الطلب غير صالحة", 400));
  }

  const plan = await SafetySystemsInstallation.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!plan) {
    return next(new ErrorHandler("طلب تركيب أنظمة السلامة غير موجود", 404));
  }

  res.status(200).json({
    success: true,
    message: "تم تحديث حالة طلب تركيب أنظمة السلامة بنجاح",
    data: plan,
  });
});
