import express from "express";
import { imagePrompt, textPrompt } from "../controllers/prompt_controllers";
import multer from "multer";
import path from "path";

let router = express.Router();

const storage = multer.diskStorage({
  destination: (_, $, cb) => {
    cb(null, path.dirname(__dirname) + "/uploads");
  },
  filename: (_, file, cb) => {
    cb(
      null,
      file.originalname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage });

router.post("/text", textPrompt);
router.post("/image", upload.single("image"), imagePrompt);

export default router;
