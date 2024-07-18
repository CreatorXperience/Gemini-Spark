"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genAI = exports.initializeVertex = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const socket_connection_1 = __importDefault(require("./utils/socket_connection"));
const winston_1 = __importDefault(require("winston"));
const socket_io_1 = require("socket.io");
const generative_ai_1 = require("@google/generative-ai");
const prompt_1 = __importDefault(require("./routes/prompt"));
const vertex_ai_1 = require("./services/vertex.ai");
const genai_1 = require("./services/genai");
(0, dotenv_1.config)();
const logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.json(),
    transports: [
        new winston_1.default.transports.File({ filename: "err.log", level: "error" }),
        new winston_1.default.transports.Console({ level: "info" }),
    ],
});
const PORT = process.env.PORT || 3000;
if (!process.env.GEMINI_API_KEY) {
    logger.error("Invalid or Empty Api key ");
    throw new generative_ai_1.GoogleGenerativeAIError("Invalid or Empty Api key");
}
let initializeVertex = (0, vertex_ai_1.initVertex)();
exports.initializeVertex = initializeVertex;
let genAI = (0, genai_1.initGemini)();
exports.genAI = genAI;
let { server, app } = (0, socket_connection_1.default)();
app.get("/", (_, res) => {
    return res.send("Welcome to this ApI");
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/spark", prompt_1.default);
const socketIO = new socket_io_1.Server(server);
socketIO.on("connection", (socket) => {
    logger.info("connected to socket");
});
server.listen(PORT, () => {
    logger.info(`Listening on port ${PORT}`);
});
