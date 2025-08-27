import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import ErrorHandler from "../../middleware/error.js";
import SafetyPlan from "../../models/servicesmodel/SafetyPlanModel.js";

export const createSafetyPlan = catchAsyncError(async (req, res, next) => {
  const { name, phone } = req.body;
  
  if (!name || !phone) {
    return next(new ErrorHandler("الاسم ورقم الهاتف مطلوبان", 400));
  }

  const files = req.files || {};
  const autocadFile = files.autocadFile?.[0];
  const buildingLicense = files.buildingLicense?.[0];
  const ownerId = files.ownerId?.[0];

  const plan = await SafetyPlan.create({
    name,
    phone,
    autocadFile: autocadFile ? `/uploads/safety-plans/${autocadFile.filename}` : null,
    buildingLicense: buildingLicense ? `/uploads/safety-plans/${buildingLicense.filename}` : null,
    ownerId: ownerId ? `/uploads/safety-plans/${ownerId.filename}` : null,
    createdBy: req.user?._id,
  });

  res.status(201).json({
    success: true,
    message: "تم إنشاء مخطط السلامة بنجاح",
    data: plan,
  });
});

export const getAllSafetyPlans = catchAsyncError(async (req, res,next) => {
  const plans = await SafetyPlan.find().sort({createdBy:-1})

   if (!plans || plans.length === 0) {
   return next(new ErrorHandler("لا توجد طلبات مسجلة", 404));
   }

  res.status(200).json({
    success: true,
    data: plans,
  });
});

// export const getRehabilitation = catchAsyncError(async (req, res, next) => {
//   const data = await Rehabilitation.find().sort({ createdAt: -1 });

//   if (!data || data.length === 0) {
//     return next(new ErrorHandler("لا توجد طلبات مسجلة", 404));
//   }

//   res.status(200).json({
//     success: true,
//     count: data.length,
//     data: data,
//   });
// });

export const updateStatusSafetyPlans = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return next(new ErrorHandler("حالة الطلب مطلوبة", 400));
  }

  const validStatuses = ["pending", "completed"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler("حالة الطلب غير صالحة", 400));
  }

  const plan = await SafetyPlan.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!plan) {
    return next(new ErrorHandler("مخطط السلامة غير موجود", 404));
  }

  res.status(200).json({
    success: true,
    message: "تم تحديث حالة مخطط السلامة بنجاح",
    data: plan,
  });
});


export const getAllSafetyPlanbyId = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const plan = await SafetyPlan.findById(id);

  if (!plan) {
    return next(new ErrorHandler("مخطط السلامة غير موجود", 404));
  }

  res.status(200).json({
    success: true,
    data: plan,
  });
});