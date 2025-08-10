import mongoose from "mongoose";

const emailModalSchema = new mongoose.Schema(
    {
        Fullname: {
            type: String,
            required: [true, "الاسم الكامل مطلوب"],
            trim: true,
        },
        PhoneNumber: {
            type: String,
            required: [true, "رقم الهاتف مطلوب"],
            trim: true,
        },
        Details: {
            type: String,
            required: [true, "التفاصيل مطلوبة"],
            trim: true,
        },
        OrderForm: {
            type: Number,
            default: 0, 
        }
    }
);

// Middleware قبل الحفظ
emailModalSchema.pre('save', async function(next) {
    if (this.isNew) { 
        const lastForm = await FormModel.findOne().sort({ OrderForm: -1 });
        this.OrderForm = lastForm ? lastForm.OrderForm + 1 : 1;
    }
    next();
});

const FormModel = mongoose.model("Form", emailModalSchema);

export default FormModel;