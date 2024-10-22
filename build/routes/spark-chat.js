"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const group_chat_prompt_controllers_1 = require("../controllers/group_chat_prompt_controllers");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const single_chat_prompt_controller_1 = require("../controllers/single_chat_prompt_controller");
let router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (_, $, cb) => {
        cb(null, path_1.default.dirname(__dirname) + "/uploads");
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
router.post("/group-chat-with-image", upload.single("image"), group_chat_prompt_controllers_1.textImagePrompt);
router.post("/group-chat-without-image", group_chat_prompt_controllers_1.textPrompt);
router.post("/single-chat-with-image", upload.single("image"), single_chat_prompt_controller_1.singleTextImagePrompt);
router.post("/single-chat-without-image", group_chat_prompt_controllers_1.textPrompt, single_chat_prompt_controller_1.singleTextPrompt);
// router.post("/chat", upload.single("image"), imagePrompt);
exports.default = router;
