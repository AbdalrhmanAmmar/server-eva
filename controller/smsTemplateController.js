// import { SmsTemplate } from "../models/smsTemplate.js";
// import { catchAsyncError } from "../middleware/catchAsyncError.js";

// // تحديث نص الرسالة
// export const updateSmsTemplate = catchAsyncError(async (req, res) => {
//   const { otpMessage } = req.body;

//   // نحتفظ بسجل واحد فقط للنموذج
//   const template = await SmsTemplate.findOneAndUpdate(
//     {}, 
//     { otpMessage },
//     { new: true, upsert: true }
//   );

//   res.status(200).json({
//     success: true,
//     message: "تم تحديث نص الرسالة بنجاح",
//     data: template
//   });
// });

// // الحصول على نص الرسالة
// export const getSmsTemplate = catchAsyncError(async (req, res) => {
//   const template = await SmsTemplate.findOne();
  
//   res.status(200).json({
//     success: true,
//     data: template || { otpMessage: "رمز التحقق الخاص بك هو: {code} - صلاحية الرمز 5 دقائق" }
//   });
// });