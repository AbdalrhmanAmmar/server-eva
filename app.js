import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import pointsPackageRoutes from "./routes/pointsPackageRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

import { errorMiddleware } from "./middleware/error.js";
import { connection } from "./database/DbConnection.js";
import path from "path";

config({ path: "./config.env" });


export const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


connection();



app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/points", pointsPackageRoutes);
app.use("/api/review", reviewRoutes);


// Test Route
app.get("/test", (req, res) => {
  res.json({ message: "API is working ✅" });
});

// Error handler
app.use(errorMiddleware);
