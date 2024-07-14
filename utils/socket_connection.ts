import http from "http";
import express from "express";
const app = express();

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
> | null = null;

const HttpServer = () => {
  server = http.createServer(app);
  return {server, app};
};

export default HttpServer;
