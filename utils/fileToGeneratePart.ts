import fs from "fs";
const fileToGeneratePart = (path: Express.Multer.File) => {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path.path)).toString("base64"),
      mimeType: path.mimetype,
    },
  };
};

export { fileToGeneratePart };
