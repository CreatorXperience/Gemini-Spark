import express from "express";
import { config } from "dotenv";
import HttpServer from "./utils/socket_connection";
import winston from "winston";
import { Server } from "socket.io";
import { GoogleGenerativeAIError } from "@google/generative-ai";
import groupChat from "./routes/group-chat";
import { initVertex } from "./services/vertex.ai";
import { initGemini } from "./services/genai";

config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "err.log", level: "error" }),
    new winston.transports.Console({ level: "info" }),
  ],
});

const PORT = process.env.PORT || 3000;

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

const socketIO = new Server(server);

socketIO.on("connection", (socket) => {
  logger.info("connected to socket");
});

server.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});

export { initializeVertex, genAI };
