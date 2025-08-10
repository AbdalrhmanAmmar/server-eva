
import Warehouse from "../models/WarehouseModel.js";
import { Product } from "../models/ProductModel.js";
import InventoryCount from './../models/inventoryCountModel.js';
import { catchAsyncError } from "../middleware/catchAsyncError.js";

export const createInventoryCount = catchAsyncError(async (req, res) => {
  const { warehouse, name, type, notes, selectedProducts = [], items = [] } = req.body;
  const userId = req.user.id;

  if (!warehouse || !name || !type) {
    return res.status(400).json({
      success: false,
      message: "الرجاء تعبئة جميع الحقول المطلوبة",
    });
  }

  // تحقق من وجود المخزن
  const warehouseExists = await Warehouse.findById(warehouse);
  if (!warehouseExists) {
    return res.status(404).json({
      success: false,
      message: "المخزن غير موجود",
    });
  }

  // تحقق من وجود عناصر items
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "يرجى إدخال المنتجات والكمية المجرودة",
    });
  }

  // تحقق أن كل منتج موجود ويتبع المخزن
  const productIds = items.map(item => item.product);
  const validProducts = await Product.find({
    _id: { $in: productIds },
    warehouse,
  });

  if (validProducts.length !== productIds.length) {
    return res.status(400).json({
      success: false,
      message: "بعض المنتجات المحددة غير موجودة في المخزن",
    });
  }

  // إنشاء الجرد
  const inventory = await InventoryCount.create({
    warehouse,
    name,
    type,
    notes,
    createdBy: userId,
    status: "draft",
    items,
  });

  res.status(201).json({
    success: true,
    message: "تم إنشاء الجرد بنجاح",
    data: inventory,
  });
});

// controllers/inventoryController.js


export const getInventoryCountsByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const inventories = await InventoryCount.find({ createdBy: userId })
  .populate("warehouse", "name")
  .populate({
    path: "items.product",
    select: "name sku quantity images"
  })
  .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inventories.length,
      data: inventories,
    });
  } catch (err) {
    next(err);
  }
};

// controllers/inventoryController.js
export const getInventoryCountById = catchAsyncError(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const inventory = await InventoryCount.findOne({
    _id: id,
    createdBy: userId
  })
  .populate("warehouse", "name")
  .populate("createdBy", "name")
  .populate({
    path: "items.product",
    select: "name quantity reservedQuantity costPrice price images"
  });

  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: "لم يتم العثور على سجل الجرد أو ليس لديك صلاحية الوصول إليه"
    });
  }

  res.status(200).json({
    success: true,
    data: inventory
  });
});