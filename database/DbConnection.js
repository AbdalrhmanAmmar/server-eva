import mongoose from "mongoose";

export const connection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "Eva-state",
      serverSelectionTimeoutMS: 30000, // ← زيادة المهلة إلى 30 ثانية
    })
    .then(() => {
      console.log("✅ Connected to database.");
    })
    .catch((err) => {
      console.log(`❌ Error connecting to database: ${err.message}`);
    });
};
