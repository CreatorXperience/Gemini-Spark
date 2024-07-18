import Joi from "joi";
type TPrompt = {
  messages: string;
};
const txtPromptValidator = (payload: TPrompt) => {
  let txtValidator = Joi.object({
    messages: Joi.string(),
    prompt: Joi.string().required(),
  });

  return txtValidator.validate(payload);
};

const imgPromptValidator = (payload: TPrompt) => {
  let txtValidator = Joi.object({
    messages: Joi.string().required(),
  });

  return txtValidator.validate(payload);
};
export { txtPromptValidator, imgPromptValidator };
