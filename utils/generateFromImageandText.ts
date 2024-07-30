import { GoogleAIFileManager } from "@google/generative-ai/dist/server/server";
import { initializeVertex } from "../main";
import { TSocketReq } from "../types/content-type";
import getMemories from "./getMemories";
import { Socket } from "socket.io";

const generateFromImageAndText = async (
  socketPayload: TSocketReq & {
    imagePath: string;
  },
  socket: Socket
) => {
  if (!process.env.GEMINI_API_KEY) {
    try {
      throw new Error("GEMINI API KEY not provided");
    } catch (e) {
      return;
    }
  }

  let { memories, prompt } = getMemories(socketPayload.conversations as any);

  let chatSesssion = initializeVertex.visionGModel.startChat({
    history: memories,
  });

  const GfileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
  let GUpload = await GfileManager.uploadFile(socketPayload.imagePath, {
    mimeType: socketPayload.imagePath,
    displayName: socketPayload.imagePath,
  });

  const fileData = {
    fileData: {
      fileUri: GUpload.file.uri,
      mimeType: GUpload.file.mimeType,
    },
  };

  let response = await chatSesssion.sendMessageStream([
    { text: prompt },
    fileData,
  ]);
  for await (const item of response.stream) {
    socket.emit("spark-image", item.candidates);
  }
  await GfileManager.deleteFile(GUpload.file.name);
};

export default generateFromImageAndText;
