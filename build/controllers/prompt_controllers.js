"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imagePrompt = exports.textPrompt = void 0;
const text_prompt_validator_1 = require("../utils/text_prompt_validator");
const main_1 = __importDefault(require("../main"));
const fileToGeneratePart_1 = require("../utils/fileToGeneratePart");
const textPrompt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        return res.status(404).send({ message: "Empty payload", status: 404 });
    }
    let { error } = (0, text_prompt_validator_1.txtPromptValidator)(req.body);
    if (error) {
        return res.status(404).send({
            message: "invalid payload",
            status: 404,
        });
    }
    let model = main_1.default.getGenerativeModel({ model: "gemini-1.5-flash" });
    let result;
    try {
        result = yield model.generateContent(req.body.text);
    }
    catch (e) {
        console.log(e);
    }
    let response = result === null || result === void 0 ? void 0 : result.response;
    const gSpack = response === null || response === void 0 ? void 0 : response.text();
    res.send(gSpack);
});
exports.textPrompt = textPrompt;
const imagePrompt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(404).send({ message: "File not Found", status: 404 });
    }
    // let { error } = txtPromptValidator(req.body);
    // if (error) {
    //   return res.status(404).send({
    //     message: "invalid payload",
    //     status: 404,
    //   });
    // }
    console.log(req.file);
    let model = main_1.default.getGenerativeModel({ model: "gemini-1.5-flash" });
    let obj = [(0, fileToGeneratePart_1.fileToGeneratePart)(req.file)];
    let result;
    try {
        result = yield model.generateContent(["Do you know this", ...obj]);
    }
    catch (e) {
        console.log(e);
    }
    let response = result === null || result === void 0 ? void 0 : result.response;
    const gSpack = response === null || response === void 0 ? void 0 : response.text();
    res.send(gSpack);
});
exports.imagePrompt = imagePrompt;
