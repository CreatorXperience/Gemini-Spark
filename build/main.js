"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.genAI = exports.initializeVertex = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const socket_connection_1 = __importDefault(require("./utils/socket_connection"));
const winston_1 = __importStar(require("winston"));
const socket_io_1 = require("socket.io");
const generative_ai_1 = require("@google/generative-ai");
const spark_chat_1 = __importDefault(require("./routes/spark-chat"));
const vertex_ai_1 = require("./services/vertex.ai");
const genai_1 = require("./services/genai");
const error_1 = __importDefault(require("./middlewares/error"));
const upload_1 = __importDefault(require("./routes/upload"));
const generateFromText_1 = __importDefault(require("./utils/generateFromText"));
const redis_1 = require("./services/redis");
require("express-async-errors");
(0, dotenv_1.config)();
const PORT = process.env.PORT || 3000;
const logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp(), winston_1.format.json(), winston_1.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level}]: ${stack || message}`;
    })),
    transports: [
        new winston_1.default.transports.File({ filename: "err.log", level: "error" }),
        new winston_1.default.transports.Console({ level: "info" }),
    ],
    exceptionHandlers: (function () {
        if (process.env.NODE_ENV === "production") {
            return [
                new winston_1.default.transports.File({
                    filename: "async-exception.log",
                    level: "error",
                }),
            ];
        }
        return [new winston_1.default.transports.Console()];
    })(),
    handleExceptions: true,
    handleRejections: true,
    rejectionHandlers: [
        new winston_1.default.transports.File({ filename: "async-rejection.log" }),
    ],
});
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
app.use("/spark", spark_chat_1.default);
app.use("/upload", upload_1.default);
app.use(error_1.default);
const socketIO = new socket_io_1.Server(server, {
    cors: {
        methods: ["GET", "POST"],
        allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
        credentials: true,
    },
});
let onlineUsers = [];
let REDIS_CLIENT;
socketIO.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("connected to socket");
    socket.on("message", (message) => {
        socket.to(message[0]).emit(message[1]);
    });
    socket.on("sparkChat", (value) => __awaiter(void 0, void 0, void 0, function* () {
        let cacheObj = JSON.parse(value);
        let response = yield (0, redis_1.createRedisCacheForUser)({
            cacheValue: cacheObj.cacheValue,
            client: REDIS_CLIENT,
            userId: cacheObj.userId,
        });
        let prompt = {
            conversations: [cacheObj.cacheValue],
        };
        if (response) {
            response.forEach((item) => {
                let parsedItem = JSON.parse(item);
                prompt.conversations = [...prompt.conversations, parsedItem];
            });
        }
        (0, generateFromText_1.default)(prompt, socket);
    }));
    socket.on("image-with-message", () => { });
    socket.on("addonlineusers", (user) => {
        let userExist = onlineUsers.some((item) => item.userId === user);
        if (!userExist) {
            onlineUsers = [...onlineUsers, { userId: user, socketId: socket.id }];
        }
        else {
            onlineUsers = onlineUsers.filter((existingUser) => existingUser.userId != user);
            onlineUsers = [...onlineUsers, { userId: user, socketId: socket.id }];
        }
        socket.emit("onlineusers", onlineUsers);
        console.log(onlineUsers);
    });
    socket.on("offline", (user) => {
        onlineUsers = onlineUsers.filter((existingUser) => existingUser.userId == user);
        socket.emit("onlineusers", onlineUsers);
    });
    socket.on("create-room", (room) => {
        socket.join(room);
        console.log(room);
    });
    socket.on("join-room", (existingRoom) => {
        socket.join(existingRoom);
    });
}));
server.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    logger.info(`Listening on port ${PORT}`);
    REDIS_CLIENT = (yield (0, redis_1.createRedisClientAndConnect)());
}));
