import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/userModel.js";

dotenv.config({ path: "./config.env" });

const deleteAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await User.deleteMany({ role: "admin" });
    console.log(`✅ Deleted ${result.deletedCount} admin user(s)`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error deleting admin users:", err);
    process.exit(1);
  }
};

deleteAdmins();
