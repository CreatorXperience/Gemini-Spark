"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = __importDefault(require("socket.io"));
const http_1 = __importDefault(require("http"));
let server = null;
const HttpServer = () => {
    server = http_1.default.createServer((req, res) => { });
    let sserver = new socket_io_1.default.Server(server);
    return sserver;
};
