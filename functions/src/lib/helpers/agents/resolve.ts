import {generateSuggestedActionsGPT} from "../../../networking/openAi/resolve";
import {generateChatMessages} from "../../payloads/openai/conversation";
import {buildCustomerPrompt, buildOrderPrompt} from "../../prompts/response";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {SuggestedActions} from "../../types/shared";

export const generateSuggestedAction = async (
  chat: ChatDocument | EmailDocument,
  is_action = false,
): Promise<{action: SuggestedActions; prompt: string}> => {
  const conversation = generateChatMessages(chat.conversation);
  const customer_summary = generateCustomerSummary(chat, is_action);

  const prompt = customer_summary + "\n" + conversation;
  const action = await generateSuggestedActionsGPT(prompt);
  if (!action) return {action: "resolve", prompt};

  return {action, prompt};
};

export const generateCustomerSummary = (
  chat: ChatDocument | EmailDocument,
  is_action = false,
) => {
  const customer = buildCustomerPrompt(chat);
  const order = buildOrderPrompt(chat, is_action);

  return customer + "\n" + order;
};
