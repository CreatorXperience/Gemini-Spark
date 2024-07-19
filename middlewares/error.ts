import { NextFunction, Request, Response } from "express";
import winston from "winston";

const catchErrors = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const logger = winston.createLogger({
    level: "error",
    transports: [
      new winston.transports.File({ filename: "async-errors.log" }),
      new winston.transports.Console(),
    ],
    format: winston.format.json(),
  });

  console.log("GOT THE ERROR ooo");

  logger.error(err.message);
  if (process.env.NODE_ENV !== "production") {
    logger.error(err);
  }

  res.status(err.status || 500).send("internal server error");
};

export default catchErrors;
