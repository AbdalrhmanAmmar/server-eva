import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم المخزن مطلوب'],
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
    country: {
      type: String,
      required: [true, 'الدولة مطلوبة'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'المدينة مطلوبة'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'الحي مطلوب'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'الشارع مطلوب'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


warehouseSchema.pre('validate', async function (next) {
  if (this.isNew && (this.order === undefined || this.order === null)) {
    const Warehouse = mongoose.model('Warehouse');
    const count = await Warehouse.countDocuments();
    this.order = count + 1;
  }
  next();
});

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

export default Warehouse;
