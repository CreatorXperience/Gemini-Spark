import { Request, Response } from "express";
import { txtPromptValidator } from "../utils/text_prompt_validator";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { initializeVertex, genAI } from "../main";

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

type TContenta = {
  role: ROLE.role;
  parts: [{ text: string }];
}[];

const textPrompt = async (req: Request, res: Response) => {
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
          text: "you are an AI, Your name is Spark",
        },
        {
          text: "You are part in a chat where you will be asked to perform tasks based on the previous conversations in the chat.",
        },
      ],
    },
  });
  let chat = model.startChat({
    history: [{ role: "user", parts: [{ text: req.body.messages }] }],
  });
  let result;
  try {
    result = await chat.sendMessageStream(req.body.prompt);
  } catch (e: any) {
    console.log(e);
  }

  if (result?.stream) {
    for await (const item of result?.stream) {
      res.write(JSON.stringify(item));
    }
    return res.end();
  }
};

const textImagePrompt = async (req: Request, res: Response) => {
  let { error } = txtPromptValidator(req.body);
  if (error) {
    return res.status(404).send({
      message: "invalid payload",
      status: 404,
    });
  }
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI API KEY not provided");
  }

  let history: TContent | TContenta = [
    { role: ROLE.role, parts: [{ text: req.body.messages as string }] },
  ];

  let chatSesssion = initializeVertex.visionGModel.startChat({ history });

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
      { text: req.body.prompt },
      fileData,
    ]);

    for await (const item of response.stream) {
      res.write(JSON.stringify(item));
    }

    res.end();
    await GfileManager.deleteFile(GUpload.file.name);
  }

  let response = await chatSesssion.sendMessageStream([
    { text: req.body.prompt },
  ]);
  for await (const item of response.stream) {
    res.write(JSON.stringify(item));
  }
  res.end();
};

export { textImagePrompt, textPrompt };
