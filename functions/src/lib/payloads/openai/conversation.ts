import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";

export const generateChatMessages = (
  conversation: ChatDocument["conversation"] | EmailDocument["conversation"],
): string => {
  let messages = "**Conversation History** <br>";
  const sorted = conversation.sort((a, b) => b.time - a.time);

  for (const c of sorted) {
    if (c.sender == "agent" && !c.action && !c.is_note) {
      messages += `- Agent: ${c.message}.\n`;
    } else {
      messages += `- Customer: ${c.message}.\n`;
    }
    if (c.action == "opened") {
      break;
    }
  }

  return messages;
};
