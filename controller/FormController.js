import { catchAsyncError } from "../middleware/catchAsyncError.js";
import FormModel from './../models/FormModel.js';

export const CreateForm=catchAsyncError(async (req, res, next) => {
    const { Fullname, PhoneNumber, Details } = req.body;

    const data = await FormModel.create({
        Fullname,
        PhoneNumber,
        Details
    });

    res.status(201).json({
        success: true,
        data
    });
})

export const getAllForms = catchAsyncError(async (req, res, next) => {
    const forms = await FormModel.find().sort({ OrderForm: -1 });

    res.status(200).json({
        success: true,
        forms
    });
})