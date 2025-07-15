import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/userModel.js";

dotenv.config({ path: "./config.env" }); 

const createAdminUser = async () => {
  console.log("MONGO_URI:", process.env.MONGO_URI);

  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ phone: "966500000000" });
    if (adminExists) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const adminUser = new User({
      name: "Admin User",
      phone: "966577140900",
      password: "123456789-@#$",
      role: "admin",
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
