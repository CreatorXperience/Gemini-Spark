"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileToGeneratePart = void 0;
const fs_1 = __importDefault(require("fs"));
const fileToGeneratePart = (path) => {
    return {
        inlineData: {
            data: Buffer.from(fs_1.default.readFileSync(path.path)).toString("base64"),
            mimeType: path.mimetype,
        },
    };
};
exports.fileToGeneratePart = fileToGeneratePart;
