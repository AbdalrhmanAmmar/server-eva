// controller/inventoryItemController.js
import InventoryCountItem from "../models/inventoryCountItemModel.js";


import { catchAsyncError } from "../middleware/catchAsyncError.js";

export const createInventoryItem = catchAsyncError(async (req, res) => {
  const {
    inventoryCount,
    product,
    systemQuantity,
    countedQuantity,
    costPerUnit,
  } = req.body;

  if (
    !inventoryCount ||
    !product ||
    systemQuantity === undefined ||
    countedQuantity === undefined ||
    costPerUnit === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "يرجى تعبئة جميع الحقول المطلوبة",
    });
  }

  // احسب الفروقات
  const difference = countedQuantity - systemQuantity;
  const totalDifferenceCost = difference * costPerUnit;
  const isMatched = difference === 0;

  const item = await InventoryCountItem.create({
    inventoryCount,
    product,
    systemQuantity,
    countedQuantity,
    difference,
    costPerUnit,
    totalDifferenceCost,
    isMatched,
  });

  res.status(201).json({
    success: true,
    message: "تم إنشاء عنصر الجرد بنجاح",
    item,
  });
});
