import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import Rehabilitation from "../../models/servicesmodel/RehabilitationModel.js";

export const createRehabilitation = catchAsyncError(async (req, res, next) => {
  const { name, phone, address } = req.body;

  if (!name || !phone || !address) {
    return next(new ErrorHandler("جميع الحقول مطلوبة", 400));
  }

  const rehab = await Rehabilitation.create({ name, phone, address });

  res.status(201).json({
    success: true,
    message: "تم إنشاء الطلب بنجاح",
    data: rehab,
  });
});

export const getRehabilitation = catchAsyncError(async (req, res, next) => {
  const data = await Rehabilitation.find().sort({ createdAt: -1 });

  if (!data || data.length === 0) {
    return next(new ErrorHandler("لا توجد طلبات مسجلة", 404));
  }

  res.status(200).json({
    success: true,
    count: data.length,
    data: data,
  });
});

export const updateRehabilitationStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["pending", "completed"];
  if (!allowedStatuses.includes(status)) {
    return next(
      new ErrorHandler("قيمة الحالة غير صحيحة. القيم المسموح بها: pending, completed", 400)
    );
  }

  const rehab = await Rehabilitation.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!rehab) {
    return next(new ErrorHandler("لم يتم العثور على الطلب", 404));
  }

  res.status(200).json({
    success: true,
    message: "تم تحديث حالة الطلب بنجاح",
    data: rehab,
  });
});

export const getRehabilitationById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const rehab = await Rehabilitation.findById(id);

  if (!rehab) {
    return next(new ErrorHandler("لم يتم العثور على الطلب", 404));
  }

  res.status(200).json({
    success: true,
    data: rehab,
  });
});