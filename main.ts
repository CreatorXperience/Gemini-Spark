import express, { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import HttpServer from "./utils/socket_connection";
import winston, { format } from "winston";
import { Server } from "socket.io";
import { GoogleGenerativeAIError } from "@google/generative-ai";
import groupChat from "./routes/spark-chat";
import { initVertex } from "./services/vertex.ai";
import { initGemini } from "./services/genai";
import catchErrors from "./middlewares/error";
require("express-async-errors");
config();

const PORT = process.env.PORT || 3000;

const logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.json(),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: "err.log", level: "error" }),
    new winston.transports.Console({ level: "info" }),
  ],
  exceptionHandlers: (function () {
    if (process.env.NODE_ENV === "production") {
      return [
        new winston.transports.File({
          filename: "async-exception.log",
          level: "error",
        }),
      ];
    }
    return [new winston.transports.Console()];
  })(),
  handleExceptions: true,
  handleRejections: true,
  rejectionHandlers: [
    new winston.transports.File({ filename: "async-rejection.log" }),
  ],
});

if (!process.env.GEMINI_API_KEY) {
  logger.error("Invalid or Empty Api key ");
  throw new GoogleGenerativeAIError("Invalid or Empty Api key");
}

let initializeVertex = initVertex();
let genAI = initGemini();

let { server, app } = HttpServer();

app.get("/", (_, res) => {
  return res.send("Welcome to this ApI");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/spark", groupChat);
app.use(catchErrors);

const socketIO = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    credentials: true,
  },
});

socketIO.on("connection", (socket) => {
  logger.info("connected to socket");

  socket.on("message", (message) => {
    console.log(message);
  });
});

server.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});

export { initializeVertex, genAI };
