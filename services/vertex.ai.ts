import { VertexAI } from "@google-cloud/vertexai";
import dotenv from "dotenv";
dotenv.config();

const initVertex = () => {
  if (!process.env.PROJECT_ID) {
    throw new Error("PROJECT_ID not provided");
  }
  let init = {
    project: process.env.PROJECT_ID,
    location: "us-central1",
  };

  let textModel = "gemini-1.5-pro";

  const visionModel = "gemini-1.0-pro-vision";

  let $vertex = new VertexAI({ ...init });
  const textGModel = $vertex.getGenerativeModel({ model: textModel });
  const visionGModel = $vertex.getGenerativeModel({ model: visionModel });

  const generativeModelPreview = $vertex.preview.getGenerativeModel({
    model: textModel,
  });

  const generativeVModelPreview = $vertex.preview.getGenerativeModel({
    model: visionModel,
  });

  return {
    textGModel,
    visionGModel,
  };
};

export { initVertex };
