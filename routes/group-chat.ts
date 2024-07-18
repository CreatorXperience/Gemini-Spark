import express from "express";
import {
  textImagePrompt,
  textPrompt,
} from "../controllers/group_chat_prompt_controllers";
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

router.post("/group-chat-with-image", upload.single("image"), textImagePrompt);
router.post("/group-chat-without-image", textPrompt);
router.post("/single-chat-with-image", upload.single("image"), textImagePrompt);
router.post("/single-chat-without-image", textPrompt);

// router.post("/chat", upload.single("image"), imagePrompt);

export default router;
