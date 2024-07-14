"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const socket_connection_1 = __importDefault(require("./utils/socket_connection"));
const winston_1 = __importDefault(require("winston"));
const socket_io_1 = require("socket.io");
const generative_ai_1 = require("@google/generative-ai");
const prompt_1 = __importDefault(require("./routes/prompt"));
(0, dotenv_1.config)();
const logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.json(),
    transports: [
        new winston_1.default.transports.File({ filename: "error.log", level: "error" }),
        new winston_1.default.transports.Console({ level: "info" }),
    ],
});
const PORT = process.env.PORT || 3000;
if (!process.env.GEMINI_API_KEY) {
    logger.error("Invalid or Empty Api key ");
    throw new generative_ai_1.GoogleGenerativeAIError("Invalid or Empty Api key");
}
let genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
let { server, app } = (0, socket_connection_1.default)();
app.get("/", (req, res) => {
    return res.send("Welcome to this ApI");
});
app.use(express_1.default.json());
app.use("/prompt", prompt_1.default);
const socketIO = new socket_io_1.Server(server);
socketIO.on("connection", (socket) => {
    logger.info("connected to socket");
});
server.listen(PORT, () => {
    logger.info(`Listening on port ${PORT}`);
});
exports.default = genAI;
