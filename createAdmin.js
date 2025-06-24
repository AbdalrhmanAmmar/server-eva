import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "./models/userModel.js"; // Adjust the path as necessary
dotenv.config({ path: "./config.env" });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const hashedPassword = await bcrypt.hash("123456789-@#$", 10);

    const admin = await User.create({
      name: "Admin",
      phone: "+966577140912",
      password: hashedPassword,
      accountVerified: true,
      role: "admin",
    });

    console.log("✅ Admin Created:", admin);
    process.exit();
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
