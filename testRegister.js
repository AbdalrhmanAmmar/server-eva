import mongoose from "mongoose";
import dotenv from "dotenv";

config({ path: "./config.env" });


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to DB");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  });
