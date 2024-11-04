import {openAIRequest} from ".";
import {ChatDocument} from "../../lib/types/chats";
import {EmailDocument} from "../../lib/types/emails";
import {
  EXTRACT_ADDRESS_PROMPT,
  EXTRACT_ORDER_NUMBER_PROMPT,
  EXTRACT_PRODUCTS_PROMPT,
  MATCH_VARIANT_PROMPT,
} from "../../lib/prompts/extraction";
import {generateChatMessages} from "../../lib/payloads/openai/conversation";
import {generateCustomerSummary} from "../../lib/helpers/agents/resolve";
import {CleanedSingleVariant} from "../../lib/types/shopify/products";
import {ChangeProductLineItem} from "../../lib/types/openai/products";

export const extractOrderNumber = async (s: string) => {
  const token = process.env.CLASSIFICATION_API || "";

  const blocks = [
    {
      role: "system",
      content: EXTRACT_ORDER_NUMBER_PROMPT,
    },
    {
      role: "user",
      content: s,
    },
  ];

  const payload = {
    model: "gpt-3.5-turbo",
    messages: blocks,
    temperature: 0.7,
    top_p: 1,
    max_completion_tokens: 10,
  };

  const {data} = await openAIRequest("/chat/completions", token, payload);
  if (!data) return null;
  const response = data as ChatCompletionResponse;
  const order_number = response.choices[0].message.content;
  if (!order_number) return null;

  console.log({
    NUMBER_EXTRACTION_TOKENS: response.usage.total_tokens.toFixed(1),
  });
  return order_number;
};

export const extractAddressFromThread = async (
  chat: ChatDocument | EmailDocument,
) => {
  const token = process.env.CLASSIFICATION_API || "";

  const conversation = generateChatMessages(chat.conversation);
  const customer_summary = generateCustomerSummary(chat);

  const thread = conversation + "\n" + customer_summary;

  const blocks = [
    {
      role: "system",
      content: EXTRACT_ADDRESS_PROMPT,
    },
    {
      role: "user",
      content: thread,
    },
  ];

  const payload = {
    model: "gpt-3.5-turbo",
    messages: blocks,
    temperature: 0.7,
    top_p: 1,
    max_completion_tokens: 400,
  };

  const {data} = await openAIRequest("/chat/completions", token, payload);
  if (!data) return null;
  const response = data as ChatCompletionResponse;
  const new_address = response.choices[0].message.content;
  if (!new_address) return null;

  console.log({
    ADDRESS_EXTRACTION_TOKENS: response.usage.total_tokens.toFixed(1),
  });
  return new_address;
};

export const extractProductsFromThread = async (
  chat: ChatDocument | EmailDocument,
) => {
  const token = process.env.CLASSIFICATION_API || "";

  const conversation = generateChatMessages(chat.conversation);
  const customer_summary = generateCustomerSummary(chat, true);

  const thread = conversation + "\n" + customer_summary;

  const blocks = [
    {
      role: "system",
      content: EXTRACT_PRODUCTS_PROMPT,
    },
    {
      role: "user",
      content: thread,
    },
  ];

  const payload = {
    model: "gpt-3.5-turbo",
    messages: blocks,
    temperature: 0.7,
    top_p: 1,
    max_completion_tokens: 400,
  };

  const {data} = await openAIRequest("/chat/completions", token, payload);
  if (!data) return null;
  const response = data as ChatCompletionResponse;
  const product_list = response.choices[0].message.content;
  if (!product_list) return null;

  console.log({
    PRODUCT_CHANGE_EXTRACTION_TOKENS: response.usage.total_tokens.toFixed(1),
  });
  return product_list;
};

export const findCorrectVariantFromProduct = async (
  product: CleanedSingleVariant[],
  li: ChangeProductLineItem,
) => {
  const token = process.env.CLASSIFICATION_API || "";

  let prompt = "**Shopify Product Variant List** \n";

  for (const v of product) {
    prompt += ` - ${v.title} (Variant ID: ${v.variant_id}) \n`;
  }

  prompt += ` 
    **CUSTOMER Variant Change Request**: \n 
      - ${li.quantity} x ${li.title} (${li.options}) \n
  `;

  const blocks = [
    {
      role: "system",
      content: MATCH_VARIANT_PROMPT,
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const payload = {
    model: "gpt-3.5-turbo",
    messages: blocks,
    temperature: 0.7,
    top_p: 1,
    max_completion_tokens: 400,
  };

  const {data} = await openAIRequest("/chat/completions", token, payload);
  if (!data) return null;
  const response = data as ChatCompletionResponse;
  const product_list = response.choices[0].message.content;
  if (!product_list) return null;

  console.log({
    MATCH_IDS_TOKENS: response.usage.total_tokens.toFixed(1),
  });
  return product_list;
};
