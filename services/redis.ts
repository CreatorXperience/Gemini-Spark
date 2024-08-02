import { createClient, RedisClientType } from "redis";
import { config } from "dotenv";
import winston from "winston";
import { TUserRedisCache } from "../types/content-type";
config();

const logger = winston.createLogger({
  level: "error",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "redis",
      format: winston.format.json(),
    }),
  ],
  format: winston.format.json(),
  handleExceptions: true,
  handleRejections: true,
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});

const createRedisClientAndConnect = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", (err) => {
    if (err) {
      return logger.error(`Redis Client error ${err}`);
    }
  });

  try {
    await client.connect();
  } catch (e) {
    logger.error(`error occured while connecting to redis server ${e}`);
  }

  client.on("connect", () => {
    logger.info("connected to redis server successfully");
  });

  return client;
};

const getRedisCacheForUser = async (cacheObj: TUserRedisCache) => {
  try {
    let history = await cacheObj.client.lRange(cacheObj.userId, 0, -1);
    if (history?.length && history.length > 1) {
      if (history.length > 50) {
        let reducedLength = Math.floor(history.length / 2);
        history = history.slice(0, reducedLength - 1);
        try {
          await cacheObj.client.del(cacheObj.userId);
          let multi = cacheObj.client.multi();
          history.forEach((item) => {
            multi.rPush(cacheObj.userId, item);
          });

          try {
            let response = await multi.exec();
            if (response) {
              return history;
            }
          } catch (err) {
            logger.error(
              `error occured while executing multiple command ${cacheObj.userId} to redis`,
              err
            );
          }
          return null;
        } catch (err) {
          logger.error(
            `error occured while processing ${cacheObj.userId} cache from redis`,
            err
          );
        }
        return history;
      }
      return history;
    }
    return null;
  } catch (err) {
    logger.error(
      `error occured while retrieveing ${cacheObj.userId} from redis`,
      err
    );
    return null;
  }
};

const createRedisCacheForUser = async (cacheObj: TUserRedisCache) => {
  try {
    await cacheObj.client.rPush(cacheObj.userId, cacheObj.cacheValue);
    let history = await getRedisCacheForUser({
      cacheValue: cacheObj.cacheValue,
      client: cacheObj.client,
      userId: cacheObj.userId,
    });

    return history;
  } catch (err) {
    logger.error(
      `error occured while adding ${cacheObj.cacheValue} to redis`,
      err
    );

    return null;
  }
};

export {
  createRedisCacheForUser,
  getRedisCacheForUser,
  createRedisClientAndConnect,
};
