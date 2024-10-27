import {openAIRequest} from ".";
import {EXTRACT_ORDER_NUMBER_PROMPT} from "../../lib/prompts/extraction";

export const extractOrderNumber = async (s: string) => {
  const token = process.env.CLASSIFICATION_API || "";

  const blocks = {
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: EXTRACT_ORDER_NUMBER_PROMPT,
      },
      {
        role: "user",
        content: s,
      },
    ],
    temperature: 0,
    top_p: 1,
    max_completion_tokens: 5,
  };

  const payload = {
    model: "gpt-4-turbo",
    messages: blocks,
    temperature: 0.7,
    top_p: 1,
    max_completion_tokens: 400,
  };

  const {data} = await openAIRequest("/chat/completions", token, payload);
  const response = data as ChatCompletionResponse;
  const order_number = response.choices[0].message.content;
  if (!order_number) return null;

  return order_number;
};
