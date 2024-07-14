import express from "express";
import textPrompt from "../controllers/prompt_controllers";

let router = express.Router();

router.post("/text", textPrompt);

export default router;
