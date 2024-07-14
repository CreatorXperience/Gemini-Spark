import { Request, Response, text } from "express";
import { txtPromptValidator } from "../utils/text_prompt_validator";
import genAI from "../main";

const textPrompt = async (req:Request,res:Response)=>{
 if(!req.body){
    return res.status(404).send({message: "Empty payload",status:404})
 }
let {error} = txtPromptValidator(req.body)
if(error){
  return  res.status(404).send({
        message: "invalid payload",
        status: 404
    })
}

let model =  genAI.getGenerativeModel({model: "gemini-1.5-flash"})
let result
try{
result  = await model.generateContent(req.body.text) 
}catch(e:any){
    console.log(e)
}

let response = await result?.response
const gSpack = response?.text()
res.send(gSpack)
}

export default textPrompt