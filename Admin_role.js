import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";  // مهم لتشفير الباسورد
import { User } from "./models/userModel.js";

dotenv.config({ path: "./config.env" });

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ phone: "966500000000" });
    if (adminExists) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // تشفير الباسورد يدوياً
    const hashedPassword = await bcrypt.hash("112233445566", 10);

    const adminUser = new User({
      name: "Admin User",
      phone: "966500000011",
      password: hashedPassword,
      role: "admin",  // تأكد انها موجودة هنا
      accountVerified: true,
    });

    await adminUser.save();

    console.log("Admin user created:", adminUser);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdminUser();
