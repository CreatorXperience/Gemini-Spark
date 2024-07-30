import express from "express";
import { config } from "dotenv";
import HttpServer from "./utils/socket_connection";
import winston, { format } from "winston";
import { Server } from "socket.io";
import { GoogleGenerativeAIError } from "@google/generative-ai";
import groupChat from "./routes/spark-chat";
import { initVertex } from "./services/vertex.ai";
import { initGemini } from "./services/genai";
import catchErrors from "./middlewares/error";
import uploadImage from "./routes/upload";
import { TSocketReq } from "./types/content-type";
import generateFromText from "./utils/generateFromText";
require("express-async-errors");
config();

type TOnlineUser = {
  socketId: string;
  userId: string;
};

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
app.use("/upload", uploadImage);
app.use(catchErrors);

const socketIO = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    credentials: true,
  },
});

let onlineUsers: TOnlineUser[] = [];

socketIO.on("connection", (socket) => {
  logger.info("connected to socket");

  socket.on("message", (message) => {
    socket.to(message[0]).emit(message[1]);
  });

  socket.on("sparkChat", (value: string) => {
    let realData = JSON.parse(value) as TSocketReq;
    console.log("from chat");
    console.log(realData);
    socket.emit("return", JSON.stringify(realData));
    generateFromText(realData, socket);
  });

  socket.on("image-with-message", () => {});

  socket.on("addonlineusers", (user) => {
    let userExist = onlineUsers.some((item) => item.userId === user);
    if (!userExist) {
      onlineUsers = [...onlineUsers, { userId: user, socketId: socket.id }];
    } else {
      onlineUsers = onlineUsers.filter(
        (existingUser) => existingUser.userId != user
      );
      onlineUsers = [...onlineUsers, { userId: user, socketId: socket.id }];
    }

    socket.emit("onlineusers", onlineUsers);
    console.log(onlineUsers);
  });

  socket.on("offline", (user) => {
    onlineUsers = onlineUsers.filter(
      (existingUser) => existingUser.userId == user
    );

    socket.emit("onlineusers", onlineUsers);
  });

  socket.on("create-room", (room) => {
    socket.join(room);
    console.log(room);
  });

  socket.on("join-room", (existingRoom) => {
    socket.join(existingRoom);
  });
});

server.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});

export { initializeVertex, genAI };
