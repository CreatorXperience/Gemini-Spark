import { GoogleGenerativeAIError } from "@google-cloud/vertexai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const initGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.log("GEMINI_API_KEY not provided");
    throw new GoogleGenerativeAIError("GEMINI_API_KEY not provided");
  }
  let genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  return genAI;
};

export { initGemini };
