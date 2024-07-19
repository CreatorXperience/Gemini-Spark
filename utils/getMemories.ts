import { TContenta } from "../types/content-type";

const getMemories = (
  conversationList: { model?: string; messages?: string }[] | [string]
) => {
  let memories: TContenta = [];

  let conversation = conversationList as
    | { model?: string; messages?: string }[]
    | [string];

  let prompt = conversationList[0] as string;

  conversation.map((item) => {
    if (typeof item === "object") {
      if (item.messages) {
        let Msg = {
          role: "user",
          parts: [{ text: item.messages as string }],
        };
        memories = [...memories, Msg];
      }
      if (item.model) {
        let model = { role: "model", parts: [{ text: item.model }] };
        memories = [...memories, model];
      }
      return memories;
    }
  });

  return { memories, prompt };
};

export default getMemories;
