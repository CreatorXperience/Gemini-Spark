"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const catchErrors = (err, req, res, next) => {
    const logger = winston_1.default.createLogger({
        level: "error",
        transports: [
            new winston_1.default.transports.File({ filename: "async-errors.log" }),
            new winston_1.default.transports.Console(),
        ],
        format: winston_1.default.format.json(),
    });
    console.log("GOT THE ERROR ooo");
    logger.error(err.message);
    if (process.env.NODE_ENV !== "production") {
        logger.error(err);
    }
    res.status(err.status || 500).send("internal server error");
};
exports.default = catchErrors;
