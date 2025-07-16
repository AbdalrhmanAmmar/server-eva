import InventoryCount from "../models/inventoryCountModel.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Product } from "../models/productModel.js";
import InventoryCountItem from "../models/inventoryCountItemModel.js";


export const createInventoryCount = catchAsyncError(async (req, res) => {
  const { warehouse, name, type, notes } = req.body;
  const userId = req.user.id;

  if (!warehouse || !name || !type) {
    return res.status(400).json({
      success: false,
      message: "الرجاء تعبئة جميع الحقول المطلوبة",
    });
  }

  const inventory = await InventoryCount.create({
    warehouse,
    name,
    type,
    notes,
    createdBy: userId,
    status: "draft",
  });

  if (type === "full") {
    const products = await Product.find({ warehouse });

    const items = products.map((product) => {
      const systemQuantity = product.quantity || 0;
      const costPerUnit = product.cost || 0;

      return {
        inventoryCount: inventory._id,
        product: product._id,
        systemQuantity,
        countedQuantity: 0,
        difference: 0,
        costPerUnit,
        totalDifferenceCost: 0,
        isMatched: false,
      };
    });

    await InventoryCountItem.insertMany(items);
  }

  res.status(201).json({
    success: true,
    message: "تم إنشاء الجرد بنجاح",
    inventory,
  });
});
