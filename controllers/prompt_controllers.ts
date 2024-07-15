import { Request, Response } from "express";
import {
  imgPromptValidator,
  txtPromptValidator,
} from "../utils/text_prompt_validator";
import genAI from "../main";
import { fileToGeneratePart } from "../utils/fileToGeneratePart";

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

  let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  let result;
  try {
    result = await model.generateContent(req.body.text);
  } catch (e: any) {
    console.log(e);
  }

  let response = result?.response;
  const gSpack = response?.text();
  res.send(gSpack);
};

const imagePrompt = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(404).send({ message: "File not Found", status: 404 });
  }

  // let { error } = txtPromptValidator(req.body);
  // if (error) {
  //   return res.status(404).send({
  //     message: "invalid payload",
  //     status: 404,
  //   });
  // }

  console.log(req.file);
  let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  let obj = [fileToGeneratePart(req.file)];

  let result;
  try {
    result = await model.generateContent(["Do you know this", ...obj]);
  } catch (e: any) {
    console.log(e);
  }

  let response = result?.response;
  const gSpack = response?.text();
  res.send(gSpack);
};

export { textPrompt, imagePrompt };
