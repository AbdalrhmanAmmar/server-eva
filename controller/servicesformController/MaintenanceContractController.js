import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import ErrorHandler from "../../middleware/error.js";
import MaintenanceContract from "../../models/servicesmodel/MaintenanceContract.js";

export const createMaintenanceContract = catchAsyncError(async (req, res, next) => {
  const { 
    entityType,
    name,
    commercialRegisterNumber,
    pieceNumber,
    phone,
    email,
    activity,
    vatNumber,
    extinguisherType,
    extinguisherWeight,
    extinguisherCount,
    address,
    planNumber,
    area,
    systems // This should be a JSON string that we'll parse
  } = req.body;

  const requiredFields = [
    'entityType', 'name', 'commercialRegisterNumber', 'pieceNumber',
    'phone', 'email', 'activity', 'vatNumber', 'extinguisherType',
    'extinguisherWeight', 'extinguisherCount', 'address', 'planNumber', 'area'
  ];

  // Check for missing required fields
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new ErrorHandler(`حقل ${field} مطلوب`, 400));
    }
  }

  // Handle file uploads
  const maintenanceContractFile = req.files?.maintenanceContract?.[0];
  const rentContractFile = req.files?.rentContract?.[0];
  const commercialRegisterFile = req.files?.commercialRegisterFile?.[0];
  const buildingLicenseFile = req.files?.buildingLicense?.[0];

  // Parse systems if it's provided as a JSON string
  let parsedSystems = [];
  if (systems) {
    try {
      parsedSystems = typeof systems === 'string' ? JSON.parse(systems) : systems;
      if (!Array.isArray(parsedSystems)) {
        return next(new ErrorHandler("أنظمة الحماية يجب أن تكون مصفوفة", 400));
      }
    } catch (error) {
      return next(new ErrorHandler("تنسيق أنظمة الحماية غير صحيح", 400));
    }
  }

  // Create the maintenance contract
  const contract = await MaintenanceContract.create({
    entityType,
    name,
    commercialRegisterNumber,
    pieceNumber,
    phone,
    email,
    activity,
    vatNumber,
    extinguisherType,
    extinguisherWeight,
    extinguisherCount,
    address,
    planNumber,
    area,
    systems: parsedSystems,
    maintenanceContract: maintenanceContractFile ? `/uploads/${maintenanceContractFile.filename}` : null,
    rentContract: rentContractFile ? `/uploads/${rentContractFile.filename}` : null,
    commercialRegisterFile: commercialRegisterFile ? `/uploads/${commercialRegisterFile.filename}` : null,
    buildingLicense: buildingLicenseFile ? `/uploads/${buildingLicenseFile.filename}` : null,
    createdAt: new Date()
  });

  res.status(201).json({
    success: true,
    message: "تم إنشاء عقد الصيانة بنجاح",
    data: contract,
  });
});

export const getMaintenanceContracts = catchAsyncError(async (req, res, next) => {
  try {
    const contracts = await MaintenanceContract.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: "تم جلب عقود الصيانة بنجاح",
      data: contracts,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});


export const getMaintenanceContractById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const contract = await MaintenanceContract.findById(id);

  if (!contract) {
    return next(new ErrorHandler("عقد الصيانة غير موجود", 404));
  }

  res.status(200).json({
    success: true,
    data: contract,
  });
});

export const updateMaintenanceStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return next(new ErrorHandler("حالة العقد مطلوبة", 400));
  }

  const validStatuses = ["pending", "completed"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler("حالة العقد غير صالحة", 400));
  }

  const contract = await MaintenanceContract.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!contract) {
    return next(new ErrorHandler("عقد الصيانة غير موجود", 404));
  }

  res.status(200).json({
    success: true,
    message: "تم تحديث حالة عقد الصيانة بنجاح",
    data: contract,
  });
});
