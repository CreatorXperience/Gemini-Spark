"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prompt_controllers_1 = __importDefault(require("../controllers/prompt_controllers"));
let router = express_1.default.Router();
router.post("/text", prompt_controllers_1.default);
exports.default = router;
