import {Conversation} from "../../types/shared";

export const generateChatMessages = (conversation: Conversation[]): string => {
  let messages = "**Conversation History** <br>" + "\n";

  const sortedConversation = conversation
    .slice()
    .sort((a, b) => b.time - a.time);
  const list = [];

  for (const c of sortedConversation) {
    if (c.action === "opened") {
      break;
    }
    list.push(c);
  }

  for (const c of list.sort((a, b) => a.time - b.time)) {
    if (c.sender === "agent" && !c.is_note) {
      messages += `- Agent: ${c.message}.\n`;
    } else if (c.sender === "customer") {
      messages += `- Customer: ${c.message}.\n`;
    }
  }

  return messages;
};

export const fetchChatMessages = (
  conversation: Conversation[],
): Conversation[] => {
  const convo: Conversation[] = [];
  const sortedConversation = conversation
    .slice()
    .sort((a, b) => b.time - a.time);
  const list = [];

  for (const c of sortedConversation) {
    if (c.action === "opened") {
      break;
    }
    list.push(c);
  }

  for (const c of list.sort((a, b) => a.time - b.time)) {
    if (c.sender === "agent" && !c.is_note) {
      convo.push(c);
    } else if (c.sender === "customer") {
      convo.push(c);
    }
  }

  return convo;
};
