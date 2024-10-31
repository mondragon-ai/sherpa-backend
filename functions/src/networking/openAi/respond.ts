import {openAIRequest} from ".";
import {VALID_CUSTOMER_EMAIL_PROMPT} from "../../lib/prompts/validateEmail";

type BlockType = {
  role: "user" | "system" | "assistant";
  content: string;
};

export const respondToChatGPT = async (
  blocks: BlockType[],
): Promise<string | null> => {
  const token = process.env.CLASSIFICATION_API || "";

  const payload = {
    model: "gpt-4-turbo",
    messages: blocks,
    temperature: 0.7,
    top_p: 1,
    max_completion_tokens: 400,
  };

  const {data} = await openAIRequest("/chat/completions", token, payload);
  const response = data as ChatCompletionResponse;
  const agent = response.choices[0].message.content;
  if (!agent) return null;

  console.log({RESPOND_GPT: response.usage.total_tokens.toFixed(1)});
  return agent;
};

export const validateEmailIsCustomer = async (message: string) => {
  const token = process.env.CLASSIFICATION_API || "";

  const blocks = [
    {
      role: "system",
      content: VALID_CUSTOMER_EMAIL_PROMPT,
    },
    {
      role: "user",
      content: message,
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
  const response = data as ChatCompletionResponse;
  const is_valid = response.choices[0].message.content;
  if (!is_valid) return null;

  console.log({VALIDATE_EMAIL_TOKENS: response.usage.total_tokens.toFixed(1)});
  return is_valid;
};
