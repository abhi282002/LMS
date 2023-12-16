import path from "path";
import multer from "multer";
const upload = multer({
  dest: "upload/",
  limits: { fileSize: 50 * 1024 * 1024 },
  storage: multer.diskStorage({
    destination: "upload/",
    filename: (_req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  fileFilter: (_req, file, db) => {
    let ext = path.extname(file.originalname);
    if (
      ext !== ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".webp" &&
      ext !== ".png" &&
      ext !== ".mp4"
    ) {
      cb(new Error(`Unsupported file type! ${ext}`), false);
    }
  },
});

export default upload;
