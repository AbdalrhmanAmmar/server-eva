import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { errorMiddleware } from "./middleware/error.js";
import { connection } from "./database/DbConnection.js";
config({ path: "./config.env" });


export const app = express();


connection();



app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);

// Test Route
app.get("/test", (req, res) => {
  res.json({ message: "API is working ✅" });
});

// Error handler
app.use(errorMiddleware);
