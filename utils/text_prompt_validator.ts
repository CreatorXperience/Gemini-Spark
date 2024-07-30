import Joi from "joi";
type TPrompt = {
  conversations: [string, { messages?: string }, { model?: string }];
};
const txtPromptValidator = (payload: TPrompt) => {
  let txtValidator = Joi.object({
    conversations: Joi.array()
      .items(
        Joi.alternatives().try(
          Joi.string().required(),
          Joi.object({
            messages: Joi.string(),
            model: Joi.string(),
          }).min(1)
        )
      )
      .required(),
  }).required();

  return txtValidator.validate(payload);
};

const imgPromptValidator = (payload: TPrompt) => {
  let txtValidator = Joi.object({
    messages: Joi.string().required(),
  });

  return txtValidator.validate(payload);
};
export { txtPromptValidator, imgPromptValidator };
