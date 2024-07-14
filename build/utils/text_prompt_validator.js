"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.txtPromptValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const txtPromptValidator = (payload) => {
    let txtValidator = joi_1.default.object({
        text: joi_1.default.string().required()
    });
    return txtValidator.validate(payload);
};
exports.txtPromptValidator = txtPromptValidator;
