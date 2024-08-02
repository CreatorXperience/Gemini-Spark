import { RedisClientType } from "redis";

type TContenta = {
  role: string;
  parts: { text: string }[];
}[];

type TSocketReq = {
  conversations: [string, { messages?: string }, { model?: string }];
};

type TUserRedisCache = {
  userId: string;
  cacheValue: string;
  client: RedisClientType<any>;
};

export type { TContenta, TSocketReq, TUserRedisCache };
