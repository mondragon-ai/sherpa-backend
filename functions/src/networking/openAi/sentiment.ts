import {openAIRequest} from ".";
import {SENTIMENT_PROMPT} from "../../lib/prompts/sentiment";

export const generateSentimentGPT = async (
  history: string,
): Promise<string | null> => {
  const token = process.env.CLASSIFICATION_API || "";

  const payload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: SENTIMENT_PROMPT,
      },
      {
        role: "user",
        content: history,
      },
    ],
    temperature: 0,
    top_p: 1,
    max_completion_tokens: 10,
  };

  const {data} = await openAIRequest("/chat/completions", token, payload);
  const response = data as ChatCompletionResponse;

  const summary = response.choices[0].message.content;
  if (!summary) return null;

  console.log({SENTIMENT_TOKENS: response.usage.total_tokens.toFixed(1)});

  return summary;
};
