import express from "express";
import { config } from "dotenv";
import HttpServer from "./utils/socket_connection";
import winston from "winston";
import { Server } from "socket.io";
import {
  GoogleGenerativeAI,
  GoogleGenerativeAIError,
} from "@google/generative-ai";
import text_prompt from "./routes/prompt"

config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.Console({ level: "info" }),
  ],
});


const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  logger.error("Invalid or Empty Api key ");
  throw new GoogleGenerativeAIError("Invalid or Empty Api key");
}

let genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let {server,app} = HttpServer();

app.get("/", (req, res) => {
  return res.send("Welcome to this ApI");
});

app.use(express.json())
app.use("/prompt",text_prompt);


const socketIO = new Server(server);

socketIO.on("connection", (socket) => {
  logger.info("connected to socket");
});

server.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});


export default genAI