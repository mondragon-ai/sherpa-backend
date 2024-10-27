import {generateSuggestedActionsGPT} from "../../../networking/openAi/resolve";
import {generateChatMessages} from "../../payloads/openai/conversation";
import {buildCustomerPrompt, buildOrderPrompt} from "../../prompts/response";
import {ChatDocument} from "../../types/chats";
import {SuggestedActions} from "../../types/shared";

export const generateSuggestedAction = async (
  chat: ChatDocument,
  type: "email" | "chat",
) => {
  const conversation = generateChatMessages(chat.conversation);
  const customer_summary = generateCustomerSummary(chat);

  const prompt = conversation + "\n" + customer_summary;
  const action = await generateSuggestedActionsGPT(prompt);
  if (!action) return "resolve";

  return action as SuggestedActions;
};

export const generateCustomerSummary = (chat: ChatDocument) => {
  const customer = buildCustomerPrompt(chat);
  const order = buildOrderPrompt(chat);

  return customer + "\n" + order;
};
