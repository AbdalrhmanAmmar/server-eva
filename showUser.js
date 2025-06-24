// server/showUsers.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/userModel.js";

dotenv.config({ path: "./config.env" }); // ← استخدم اسم الملف الصحيح هنا

const showUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}, { phone: 1, name: 1, _id: 0 });
    console.log("📱 Existing phone numbers:");
    console.table(users);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    mongoose.disconnect();
  }
};

showUsers();
