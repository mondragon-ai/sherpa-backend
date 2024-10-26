import {ChatDocument} from "../../types/chats";

export const generateChatMessages = (
  conversation: ChatDocument["conversation"],
): string => {
  let messages = "";

  conversation.forEach((c) => {
    if (c.sender == "agent" && !c.action && !c.is_note) {
      messages += `- Agent: ${c.message}.\n`;
    } else {
      messages += `- Customer: ${c.message}.\n`;
    }
  });
  return messages;
};
