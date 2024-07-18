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
    const visionModel = "gemini-1.0-pro-vision";
    let $vertex = new vertexai_1.VertexAI(Object.assign({}, init));
    const textGModel = $vertex.getGenerativeModel({ model: textModel });
    const visionGModel = $vertex.getGenerativeModel({ model: visionModel });
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
