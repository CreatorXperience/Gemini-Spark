"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prompt_controllers_1 = require("../controllers/prompt_controllers");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
let router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (_, $, cb) => {
        cb(null, path_1.default.dirname(__dirname) + "/uploads");
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname + "-" + Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
router.post("/text", prompt_controllers_1.textPrompt);
router.post("/image", upload.single("image"), prompt_controllers_1.imagePrompt);
exports.default = router;
