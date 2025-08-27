import multer from "multer";
import path from "path";
import fs from "fs";

// تحديد مجلد الرفع
const uploadDir = path.join("uploads", "safety-systems-installation");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// السماح بكل الامتدادات مؤقتًا
const fileFilter = (req, file, cb) => {
  cb(null, true); 
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // رفعت الحد لـ 20MB مؤقتًا
});
