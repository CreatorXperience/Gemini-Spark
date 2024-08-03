import { RedisClientType } from "redis";
import { genAI } from "../main";
import { TSocketReq } from "../types/content-type";
import getMemories from "./getMemories";
import { txtPromptValidator } from "./text_prompt_validator";

const generateFromText = async (
  socketPayload: TSocketReq,
  socket: any,
  redisClient: RedisClientType,
  id: string,
  socketId?: string
) => {
  if (!socketPayload) {
    return socket.emit("generate_error", "text not found");
  }

  let { error } = txtPromptValidator(socketPayload);
  if (error) {
    return socket.emit("generate_error", "bad Payload");
  }

  let model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 1.5,
      maxOutputTokens: 2000,
    },
    systemInstruction: {
      role: "model",
      parts: [
        {
          text: "you are an AI, Your name is Spark and You are built on top of the Gemini model",
        },
        {
          text: "You are in a chat where you will be asked to perform tasks based on the previous conversations in the chat.",
        },
      ],
    },
  });

  let { memories, prompt } = getMemories(socketPayload.conversations as any);

  let chat = model.startChat({
    history: memories,
  });

  let result;
  try {
    result = await chat.sendMessageStream(prompt);
  } catch (e: any) {
    console.log(e);
  }

  if (result?.stream) {
    let history = "";
    try {
      for await (const item of result?.stream) {
        if (item.candidates) {
          history += item.candidates[0].content.parts[0].text;
          socket.to(socketId ? socketId : socket.id).emit("spark", history);
        }
        console.log(history);
      }
      if (history) await redisClient.rPush(id, `:-*model* ${history}`);
    } catch (e) {
      throw new Error("socket streaming response error");
    }
  }
};

export default generateFromText;
