import { UploadFileResponse } from "@google/generative-ai/dist/server/server";
import fs from "fs";
const fileToGeneratePart = (path: UploadFileResponse) => {
  return {
    fileData: {
      mimeType: path.file.mimeType,
      fileUri: path.file.uri,
    },
  };
};

export { fileToGeneratePart };
