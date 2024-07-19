"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getMemories = (conversationList) => {
    let memories = [];
    let conversation = conversationList;
    let prompt = conversationList[0];
    conversation.map((item) => {
        if (typeof item === "object") {
            if (item.messages) {
                let Msg = {
                    role: "user",
                    parts: [{ text: item.messages }],
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
exports.default = getMemories;
