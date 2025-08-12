import { catchAsyncError } from '../middleware/catchAsyncError.js';
import { Service } from '../models/ServiceModel.js';
import ServiceFormModel from '../models/ServicesFormModel.js';

// Configuration constants
const MIN_EXTINGUISHERS = 0;
const MIN_DETECTORS = 0;
const MIN_LIGHTS = 0;

// Helper function for validation
const validateRequiredFields = (body, requiredFields) => {
  const missingFields = requiredFields.filter(field => !body[field] && body[field] !== 0);
  return missingFields.length === 0 ? null : missingFields;
};

// ✅ Create safety certificate request
export const createSafetyRequest = catchAsyncError(async (req, res) => {
  const requiredFields = [
    'nameService',
    'interiorNumber',
    'commercialRegisterNumber',
    'activityCode',
    'shopArea',
    'region',
    'city',
    'neighborhood',
    'street',
    'signName',
    'buildingArea',
    'mobile',
    'extinguishersCount',
    'smokeDetectorsCount',
    'emergencyLightsCount'
  ];

  const missingFields = validateRequiredFields(req.body, requiredFields);
  if (missingFields) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all required fields',
      missingFields
    });
  }

 
  const { extinguishersCount, smokeDetectorsCount, emergencyLightsCount } = req.body;
  if (
    extinguishersCount < MIN_EXTINGUISHERS ||
    smokeDetectorsCount < MIN_DETECTORS ||
    emergencyLightsCount < MIN_LIGHTS
  ) {
    return res.status(400).json({
      success: false,
      message: 'Count values cannot be negative'
    });
  }

  // Create the request
  try {
    const newRequest = await ServiceFormModel.create({
      // userId: req.user._id, 
      ...req.body,
      status: 'pending' 
    });

    return res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      data: newRequest
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate request detected'
      });
    }
    throw error; 
  }
});

export const getServices = catchAsyncError(async (req, res, next) => {
  // بناء كائن الاستعلام
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  // 1) التصفية
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
  // استبدل Service بـ ServiceFormModel هنا
  let query = ServiceFormModel.find(JSON.parse(queryStr));

  // 2) الترتيب
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // 3) تحديد الحقول
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // 4) الترقيم
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numServices = await ServiceFormModel.countDocuments();
    if (skip >= numServices) throw new Error('هذه الصفحة غير موجودة');
  }

  // تنفيذ الاستعلام
  const services = await query;

  res.status(200).json({
    success: true,
    results: services.length,
    data: services,
  });
});