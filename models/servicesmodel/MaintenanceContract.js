import mongoose from "mongoose";

const MaintenanceContractSchema = new mongoose.Schema({
  entityType: { type: String, required: true },
  name: { type: String, required: true },
  commercialRegisterNumber: { type: String, required: true },
  pieceNumber: { type: String, required: true },
  maintenanceContract: { type: String }, // Will store file path
  rentContract: { type: String },
  commercialRegisterFile: { type: String },
  buildingLicense: { type: String },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  activity: { type: String, required: true },
  vatNumber: { type: String, required: true },
  extinguisherType: { type: String, required: true },
  extinguisherWeight: { type: String, required: true },
  extinguisherCount: { type: String, required: true },
  address: { type: String, required: true },
  planNumber: { type: String, required: true },
  area: { type: String, required: true },
  systems: [{
    system: { type: String, required: true },
    status: { type: String, required: true }
  }],
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.MaintenanceContract || mongoose.model("MaintenanceContract", MaintenanceContractSchema);