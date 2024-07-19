import { NextFunction, Request, Response } from "express";
import { txtPromptValidator } from "../utils/text_prompt_validator";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { initializeVertex, genAI } from "../main";
import getMemories from "../utils/getMemories";

enum ROLE {
  role = "user",
}

type TContent = {
  role: ROLE.role;
  parts: [
    { text: string },
    { fileData: { fileUri: string; mimeType: string } }
  ];
}[];

const textPrompt = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body) {
    return res.status(404).send({ message: "Empty payload", status: 404 });
  }
  let { error } = txtPromptValidator(req.body);
  if (error) {
    return res.status(404).send({
      message: "invalid payload",
      status: 404,
    });
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
          text: "you are an AI, Your name is Spark and You are built on top of the Gemini model, Please monitor the prompt and generate a response only if the text contains @Spark. If @Spark is not present in the prompt, do not generate any response no matter how the response may look.",
        },
        {
          text: "You are part of a group chat where you will be asked to perform tasks based on the previous conversations in the chat.",
        },
        {
          text: "Your prompt might be something like `user1: what's is today`\n`user2: I don't know let's ask @Spark`",
        },
      ],
    },
  });

  let { memories, prompt } = getMemories(req.body.conversations);

  let chat = model.startChat({
    history: memories,
  });
  let result;
  try {
    result = await chat.sendMessageStream(prompt);
  } catch (e: any) {
    console.log(e);
    next(e);
  }

  if (result?.stream) {
    try {
      for await (const item of result?.stream) {
        res.write(JSON.stringify(item));
      }
    } catch (e) {
      next(e);
    }
    return res.end();
  }
};

const textImagePrompt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { error } = txtPromptValidator(req.body);
  if (error) {
    return res.status(404).send({
      message: "invalid payload",
      status: 404,
    });
  }
  if (!process.env.GEMINI_API_KEY) {
    try {
      throw new Error("GEMINI API KEY not provided");
    } catch (e) {
      return next(e);
    }
  }
  let { memories, prompt } = getMemories(req.body.conversations);

  let chatSesssion = initializeVertex.visionGModel.startChat({
    history: memories,
  });

  if (req.file) {
    const GfileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    let GUpload = await GfileManager.uploadFile(req.file.path, {
      mimeType: req.file.mimetype,
      displayName: req.file.filename,
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
      res.write(JSON.stringify(item));
    }

    res.end();
    await GfileManager.deleteFile(GUpload.file.name);
  }

  let response = await chatSesssion.sendMessageStream([{ text: prompt }]);
  for await (const item of response.stream) {
    res.write(JSON.stringify(item));
  }
  res.end();
};

export { textImagePrompt, textPrompt };
