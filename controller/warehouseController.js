import { catchAsyncError } from '../middleware/catchAsyncError.js';
import Warehouse from "../models/warehouseModel.js"

export const addWarehouse = catchAsyncError(async (req, res) => {
  const {
    name,
    country,
    city,
    district,
    street,
    isActive,
  } = req.body;

  if (!name || !country || !city || !district || !street) {
    return res.status(400).json({
      success: false,
      message: 'يرجى تعبئة جميع الحقول المطلوبة',
    });
  }

  const newWarehouse = await Warehouse.create({
    name,
    country,
    city,
    district,
    street,
    isActive: isActive ?? true,
    
  });

  res.status(201).json({
    success: true,
    message: 'تم إنشاء المخزن بنجاح',
    warehouse: newWarehouse,
  });
});

export const getAllWarehouses = catchAsyncError(async (req, res) => {
  const warehouses = await Warehouse.find().sort({ order: 1 }); 

  res.status(200).json({
    success: true,
    warehouses,
  });
});

export const updateWarehouse = catchAsyncError(async (req, res) => {
  const { id } = req.params;

  // تحديد الحقول المسموحة بالتعديل
  const allowedFields = ['isActive', 'order', 'name', 'country', 'city', 'district', 'street'];

  // إنشاء كائن التحديث بناءً على الحقول الموجودة في req.body
  const updateFields = {};
  for (const key of allowedFields) {
    if (typeof req.body[key] !== 'undefined') {
      updateFields[key] = req.body[key];
    }
  }

  // إذا لم يتم إرسال أي حقل مسموح به
  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'يجب إرسال بيانات صحيحة للتحديث',
    });
  }

  const updated = await Warehouse.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'لم يتم العثور على المخزن',
    });
  }

  res.status(200).json({
    success: true,
    message: 'تم تعديل بيانات المخزن بنجاح',
    warehouse: updated,
  });
});



export const deleteWarehouse = catchAsyncError(async (req, res) => {
  const { id } = req.params;

  const deleted = await Warehouse.findByIdAndDelete(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'لم يتم العثور على المخزن لحذفه',
    });
  }

  res.status(200).json({
    success: true,
    message: 'تم حذف المخزن بنجاح',
  });
});