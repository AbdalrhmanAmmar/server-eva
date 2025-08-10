import mongoose from "mongoose";

const discountSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  discountAmount: { type: Number, required: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
  },
  description: {
    type: String,
  },
  priceBeforeDiscount: {
    type: Number,
    required: [true, "Price before discount is required"],
  },
  priceAfterDiscount: {
    type: Number,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  showQuantity: {
    type: Boolean,
    default: false,
  },
  showProduct: {
    type: Boolean,
    default: false,
  },
  showDiscount: {
    type: Boolean,
    default: false,
  },
  showRelatedProduct: {
    type: Boolean,
    default: false,
  },
  discounts: [discountSchema],
    requiresShipping: { type: Boolean, default: true },


  images: [
    {
      url: { type: String, required: true },
      isMain: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
    }
  ],
  category: {
    type: String,
  },
  tag: {
    type: String,
  },
  showTag: {
    type: Boolean,
    default: false
  },
  shortDescription: {
    type: String,
  },
  showReviews: {
    type: Boolean,
    default: true,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // ✅ الحقول الجديدة
  sku: {
    type: String,
  },
  barcode: {
    type: String,
  },
  weight: {
    type: Number,
  },
  minOrder: {
    type: Number,
  },
  maxOrder: {
    type: Number,
  },
  isTaxExempt: {
    type: Boolean,
    default: false,
  },
  relatedProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }
  ],
});

productSchema.pre('save', function(next) {
  if (this.discounts && this.discounts.length > 0) {
    const now = new Date();
    const activeDiscount = this.discounts.some(discount => 
      new Date(discount.startDate) <= now && new Date(discount.endDate) >= now
    );
    this.showDiscount = activeDiscount;
  } else {
    this.showDiscount = false;
  }
  next();
});

 const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product