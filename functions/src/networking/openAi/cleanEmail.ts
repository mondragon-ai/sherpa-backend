import {openAIRequest} from ".";
import {CLEAN_EMAIL_PROMPT} from "../../lib/prompts/extractEmail";

export const cleanEmailFromHtml = async (
  body: string,
): Promise<string | null> => {
  const token = process.env.CLASSIFICATION_API || "";

  const payload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: CLEAN_EMAIL_PROMPT,
      },
      {
        role: "user",
        content: body,
      },
    ],
    temperature: 0,
    top_p: 1,
    max_completion_tokens: 350,
  };

  const {data} = await openAIRequest("/chat/completions", token, payload);
  const response = data as ChatCompletionResponse;

  const cleaned = response.choices[0].message.content;
  if (!cleaned) return null;

  console.log({CLEAM_EMAIL_TOKENS: response.usage.total_tokens.toFixed(1)});

  return cleaned;
};
