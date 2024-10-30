import {openAIRequest} from ".";
import {EXTRACT_ORDER_NUMBER_PROMPT} from "../../lib/prompts/extraction";

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
    max_completion_tokens: 400,
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
