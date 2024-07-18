import express from "express";
import { textImagePrompt, textPrompt } from "../controllers/prompt_controllers";
import multer from "multer";
import path from "path";

let router = express.Router();

const storage = multer.diskStorage({
  destination: (_, $, cb) => {
    cb(null, path.dirname(__dirname) + "/uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/chat-with-image", upload.single("image"), textImagePrompt);
router.post("/chat-without-image", textPrompt);
// router.post("/chat", upload.single("image"), imagePrompt);

export default router;
