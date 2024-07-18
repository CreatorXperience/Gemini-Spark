"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initVertex = void 0;
const vertexai_1 = require("@google-cloud/vertexai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const initVertex = () => {
    if (!process.env.PROJECT_ID) {
        throw new Error("PROJECT_ID not provided");
    }
    let init = {
        project: process.env.PROJECT_ID,
        location: "us-central1",
    };
    let textModel = "gemini-1.5-pro";
    let visionModel = "gemini-1.0-pro-vision";
    let instruction = {
        role: "model",
        parts: [
            {
                text: "you are an AI, Your name is Spark, Please monitor the prompt and generate a response only if the text contains @Spark. If @Spark is not present in the prompt, do not generate any response.",
            },
            {
                text: "You are part of a group chat where you will be asked to perform tasks based on the previous conversations in the chat.",
            },
            {
                text: "Your prompt might be something like `user1: what's is today`\n`user2: I don't know let's ask @Spark`",
            },
        ],
    };
    let $vertex = new vertexai_1.VertexAI(Object.assign({}, init));
    const textGModel = $vertex.getGenerativeModel({
        model: textModel,
        systemInstruction: instruction,
    });
    const visionGModel = $vertex.getGenerativeModel({
        model: visionModel,
        systemInstruction: instruction,
    });
    const generativeModelPreview = $vertex.preview.getGenerativeModel({
        model: textModel,
    });
    const generativeVModelPreview = $vertex.preview.getGenerativeModel({
        model: visionModel,
    });
    return {
        textGModel,
        visionGModel,
    };
};
exports.initVertex = initVertex;
