"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imgPromptValidator = exports.txtPromptValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const txtPromptValidator = (payload) => {
    let txtValidator = joi_1.default.object({
        conversations: joi_1.default.array()
            .items(joi_1.default.alternatives().try(joi_1.default.string().required(), joi_1.default.object({
            messages: joi_1.default.string(),
            model: joi_1.default.string(),
        }).min(1)))
            .required(),
    }).required();
    return txtValidator.validate(payload);
};
exports.txtPromptValidator = txtPromptValidator;
const imgPromptValidator = (payload) => {
    let txtValidator = joi_1.default.object({
        messages: joi_1.default.string().required(),
    });
    return txtValidator.validate(payload);
};
exports.imgPromptValidator = imgPromptValidator;
