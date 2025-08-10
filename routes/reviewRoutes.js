// import express from "express";
// import {
//   addReview,
//   getReviewsByProduct,
//   deleteReview,
//   updateReview,
//   getAverageRating,
// } from "../controller/reviewController.js";
// import { isAuthenticated } from "../middleware/auth.js"; // تأكد أن عندك هذا الميدل وير

// const router = express.Router();

// // 📝 إضافة مراجعة جديدة (محمي)
// router.post("/",  isAuthenticated,addReview);

// // 📥 الحصول على كل المراجعات الخاصة بمنتج
// router.get("/product/:productId", getReviewsByProduct);

// // 📊 الحصول على متوسط التقييم وعدد المراجعات
// router.get("/average/:productId", getAverageRating);

// // 🗑️ حذف مراجعة (محمي)
// router.delete("/:id", isAuthenticated, deleteReview);

// // ✏️ تعديل مراجعة (محمي)
// router.put("/:id", isAuthenticated, updateReview);

// export default router;
