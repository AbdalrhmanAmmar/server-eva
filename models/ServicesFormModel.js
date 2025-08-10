import mongoose from "mongoose"

const SafetyRequestSchema = new mongoose.Schema({
  // userId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true,
  // },
  interiorNumber: {
    type: String,
    required: true,
    trim: true
  },
  commercialRegisterNumber: {
    type: String,
    required: true,
    trim: true
  },
  activityCode: {
    type: String,
    required: true,
    trim: true
  },
  shopArea: {
    type: Number,  // تغيير من String إلى Number
    required: true
  },
  region: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  neighborhood: {
    type: String,
    required: true,
    trim: true
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  signName: {
    type: String,
    required: true,
    trim: true
  },
  buildingArea: {
    type: Number,  // تغيير من String إلى Number
    required: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  extinguishersCount: {
    type: Number,
    required: true
  },
  smokeDetectorsCount: {
    type: Number,
    required: true
  },
  emergencyLightsCount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true })

const ServiceFormModel = mongoose.model('SafetyRequest', SafetyRequestSchema)

export default ServiceFormModel