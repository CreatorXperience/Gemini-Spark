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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleTextPrompt = exports.singleTextImagePrompt = void 0;
const text_prompt_validator_1 = require("../utils/text_prompt_validator");
const server_1 = require("@google/generative-ai/server");
const main_1 = require("../main");
const getMemories_1 = __importDefault(require("../utils/getMemories"));
var ROLE;
(function (ROLE) {
    ROLE["role"] = "user";
})(ROLE || (ROLE = {}));
const singleTextPrompt = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
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
    let model = main_1.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
            temperature: 1.5,
            maxOutputTokens: 2000,
        },
        systemInstruction: {
            role: "model",
            parts: [
                {
                    text: "you are an AI, Your name is Spark and you're build on top of the Gemini model",
                },
                {
                    text: "You are part of a chat with a single user where you will be asked to perform tasks based on the previous conversations in the chat, Do not respond to history from many users",
                },
            ],
        },
    });
    let { memories, prompt } = (0, getMemories_1.default)(req.body.conversations);
    let chat = model.startChat({
        history: memories,
    });
    let result;
    try {
        result = yield chat.sendMessageStream(prompt);
    }
    catch (e) {
        console.log(e);
        next(e);
    }
    if (result === null || result === void 0 ? void 0 : result.stream) {
        try {
            try {
                for (var _d = true, _e = __asyncValues(result === null || result === void 0 ? void 0 : result.stream), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const item = _c;
                    res.write(JSON.stringify(item));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        catch (e) {
            next(e);
        }
        return res.end();
    }
});
exports.singleTextPrompt = singleTextPrompt;
const singleTextImagePrompt = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_2, _b, _c, _d, e_3, _e, _f;
    let { error } = (0, text_prompt_validator_1.txtPromptValidator)(req.body);
    if (error) {
        return res.status(404).send({
            message: "invalid payload",
            status: 404,
        });
    }
    if (!process.env.GEMINI_API_KEY) {
        try {
            throw new Error("GEMINI API KEY not provided");
        }
        catch (e) {
            return next(e);
        }
    }
    let { memories, prompt } = (0, getMemories_1.default)(req.body.conversations);
    let chatSesssion = main_1.initializeVertex.visionGModel.startChat({
        history: memories,
    });
    if (req.file) {
        const GfileManager = new server_1.GoogleAIFileManager(process.env.GEMINI_API_KEY);
        let GUpload = yield GfileManager.uploadFile(req.file.path, {
            mimeType: req.file.mimetype,
            displayName: req.file.filename,
        });
        const fileData = {
            fileData: {
                fileUri: GUpload.file.uri,
                mimeType: GUpload.file.mimeType,
            },
        };
        let response = yield chatSesssion.sendMessageStream([
            { text: prompt },
            fileData,
        ]);
        try {
            try {
                for (var _g = true, _h = __asyncValues(response.stream), _j; _j = yield _h.next(), _a = _j.done, !_a; _g = true) {
                    _c = _j.value;
                    _g = false;
                    const item = _c;
                    res.write(JSON.stringify(item));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_g && !_a && (_b = _h.return)) yield _b.call(_h);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        catch (e) {
            next(e);
        }
        res.end();
        yield GfileManager.deleteFile(GUpload.file.name);
    }
    let response = yield chatSesssion.sendMessageStream([{ text: prompt }]);
    try {
        for (var _k = true, _l = __asyncValues(response.stream), _m; _m = yield _l.next(), _d = _m.done, !_d; _k = true) {
            _f = _m.value;
            _k = false;
            const item = _f;
            res.write(JSON.stringify(item));
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (!_k && !_d && (_e = _l.return)) yield _e.call(_l);
        }
        finally { if (e_3) throw e_3.error; }
    }
    res.end();
});
exports.singleTextImagePrompt = singleTextImagePrompt;
