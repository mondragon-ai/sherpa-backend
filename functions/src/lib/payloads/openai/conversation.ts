import {Conversation} from "../../types/shared";

export const generateChatMessages = (conversation: Conversation[]): string => {
  let messages = "**Conversation History** <br>" + "\n";

  const sortedConversation = conversation.sort((a, b) => b.time - a.time);
  const list = [];
  console.log({sortedConversation});

  for (const c of sortedConversation) {
    if (c.action === "opened") {
      break;
    }
    list.push(c);
  }

  for (const c of list) {
    // Append message based on sender
    if (c.sender === "agent" && !c.is_note) {
      messages += `- Agent: ${c.message}.\n`;
    } else if (c.sender === "customer") {
      messages += `- Customer: ${c.message}.\n`;
    }
  }
  conversation.sort((a, b) => a.time - b.time);

  console.log({messages});
  return messages;
};
