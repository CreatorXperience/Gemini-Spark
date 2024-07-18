"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGemini = void 0;
const vertexai_1 = require("@google-cloud/vertexai");
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const initGemini = () => {
    if (!process.env.GEMINI_API_KEY) {
        console.log("GEMINI_API_KEY not provided");
        throw new vertexai_1.GoogleGenerativeAIError("GEMINI_API_KEY not provided");
    }
    let genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    return genAI;
};
exports.initGemini = initGemini;
