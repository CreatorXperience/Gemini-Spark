import { Request, Response } from "express";

const uploadImage = async (req: Request, res: Response) => {
  if (req.file) {
    return res.send(req.file.path);
  }
  res.status(404).send("no file uploaded");
};

export default uploadImage;
