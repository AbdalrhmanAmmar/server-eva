import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import pointsPackageRoutes from "./routes/pointsPackageRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import warehouseRoute from "./routes/warehouseRoute.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import FormService from "./routes/FormService.js";

import { errorMiddleware } from "./middleware/error.js";
import { connection } from "./database/DbConnection.js";
import path from "path";
import ServiceFormRoutes from "./routes/ServiceFormRoutes.js"; // Import the new route

config({ path: "./config.env" });


export const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true, 

}));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get("/cors-test", (req, res) => {
  res.json({ message: "CORS working ✅" });
});



connection();



app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/points", pointsPackageRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/warehouses", warehouseRoute);
app.use("/api/inventories", inventoryRoutes);
app.use("/api/Form", FormService); // Add FormService route
app.use("/api/FormService", ServiceFormRoutes); // Add ServiceFormRoutes



// Test Route
app.get("/test", (req, res) => {
  res.json({ message: "API is working ✅" });
});

// Error handler
app.use(errorMiddleware);
