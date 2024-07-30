import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import uploadImage from "../controllers/upload-image";

const storage = multer({
  storage: multer.diskStorage({
    destination: (_, $, cb) => {
      return cb(null, path.join(__dirname, "uploads"));
    },
    filename: (_, file, cb) => {
      return cb(null, file.originalname + "." + "png");
    },
  }),
});

router.post("/", storage.single("image"), uploadImage);

export default router;
