import {generateSuggestedActionsGPT} from "../../../networking/openAi/resolve";
import {generateChatMessages} from "../../payloads/openai/conversation";
import {buildCustomerPrompt, buildOrderPrompt} from "../../prompts/response";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {SuggestedActions} from "../../types/shared";

export const generateSuggestedAction = async (
  chat: ChatDocument | EmailDocument,
  type: "email" | "chat",
): Promise<{action: SuggestedActions; prompt: string}> => {
  const conversation = generateChatMessages(chat.conversation);
  const customer_summary = generateCustomerSummary(chat);

  const prompt = conversation + "\n" + customer_summary;
  const action = await generateSuggestedActionsGPT(prompt);
  if (!action) return {action: "resolve", prompt};

  return {action, prompt};
};

export const generateCustomerSummary = (chat: ChatDocument | EmailDocument) => {
  const customer = buildCustomerPrompt(chat);
  const order = buildOrderPrompt(chat);

  return customer + "\n" + order;
};
