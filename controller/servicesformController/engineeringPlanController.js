
import { catchAsyncError } from '../../middleware/catchAsyncError.js';
import ErrorHandler from '../../middleware/error.js';
import EngineeringPlan from '../../models/servicesmodel/EngineeringPlanModel.js';

export const createEngineeringPlan = catchAsyncError(async (req, res, next) => {
  const { name, phone, activity, address } = req.body;
  const createdBy = req.user?._id;

  if (!name || !phone || !activity || !address) {
    return next(new ErrorHandler("البيانات المطلوبة غير مكتملة", 400));
  }

  // لو الملفات اتبعتت مع الفورم
  const ownerIdFile = req.files?.ownerId?.[0];
  const ownershipDocFile = req.files?.ownershipDoc?.[0];

  const plan = await EngineeringPlan.create({
    name,
    phone,
    activity,
    address,
    ownerId: ownerIdFile ? `/uploads/${ownerIdFile.filename}` : null,
    ownershipDoc: ownershipDocFile ? `/uploads/${ownershipDocFile.filename}` : null,
  });

  res.status(201).json({
    success: true,
    message: "تم إرسال الطلب بنجاح",
    data: plan,
  });
});


export const getAllEngineeringPlans = catchAsyncError(async (req, res, next) => {
  const plans = await EngineeringPlan.find().sort({ createdAt: -1 });

  if (!plans || plans.length === 0) {
    return next(new ErrorHandler("لا توجد طلبات مسجلة", 404));
  }

  res.status(200).json({
    success: true,
    count: plans.length,
    data: plans,
  });
});

export const updateEngineeringPlanStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // القيم المسموح بيها
  const allowedStatuses = ["pending", "completed"];
  if (!allowedStatuses.includes(status)) {
    return next(new ErrorHandler("قيمة الحالة غير صحيحة. القيم المسموح بها: pending, completed", 400));
  }

  const plan = await EngineeringPlan.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!plan) {
    return next(new ErrorHandler("لم يتم العثور على الطلب", 404));
  }

  res.status(200).json({
    success: true,
    message: "تم تحديث حالة الطلب بنجاح",
    data: plan,
  });
});
export const getEngineeringPlanById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const plan = await EngineeringPlan.findById(id);

  if (!plan) {
    return next(new ErrorHandler("لم يتم العثور على الطلب", 404));
  }

  res.status(200).json({
    success: true,
    data: plan,
  });
});
