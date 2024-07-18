import { Request, Response } from "express";
import { txtPromptValidator } from "../utils/text_prompt_validator";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { initializeVertex, genAI } from "../main";

enum ROLE {
  role = "user",
}

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
  });
  let chat = model.startChat({
    history: [{ role: "user", parts: [{ text: req.body.text }] }],
  });
  let result;
  try {
    result = await chat.sendMessageStream(req.body.text);
  } catch (e: any) {
    console.log(e);
  }

  if (result?.stream) {
    for await (const item of result?.stream) {
      res.write(JSON.stringify(item));
    }
    res.end();
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

  let contentType = {
    contents: [{ role: ROLE.role, parts: [{ text: req.body.text }] }],
  };

  if (req.file) {
    const GfileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    let GUpload = await GfileManager.uploadFile(req.file.path, {
      mimeType: req.file.mimetype,
      displayName: req.file.filename,
    });

    const nfile = {
      fileData: {
        fileUri: GUpload.file.uri,
        mimeType: GUpload.file.mimeType,
      },
      text: req.body.text,
    };

    contentType = {
      contents: [
        {
          role: ROLE.role,
          parts: [
            {
              text: req.body.text,
            },
            nfile,
          ],
        },
      ],
    };
  }
  let contentStream = await initializeVertex.visionGModel.generateContentStream(
    contentType
  );

  for await (const data of contentStream.stream) {
    res.write(JSON.stringify(data + "\n"));
  }

  res.end();
};

export { textImagePrompt, textPrompt };
