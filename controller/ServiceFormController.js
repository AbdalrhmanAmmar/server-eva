import { catchAsyncError } from '../middleware/catchAsyncError.js';
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