import Joi from "joi";
type TPrompt = {
  text: string;
};
const txtPromptValidator = (payload: TPrompt) => {
  let txtValidator = Joi.object({
    text: Joi.string().required(),
  });

  return txtValidator.validate(payload);
};

const imgPromptValidator = (payload: TPrompt) => {
  let txtValidator = Joi.object({
    text: Joi.string().required(),
  });

  return txtValidator.validate(payload);
};
export { txtPromptValidator, imgPromptValidator };
