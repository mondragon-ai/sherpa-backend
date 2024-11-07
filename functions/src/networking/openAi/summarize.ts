import {openAIRequest} from ".";
import {SUMMARIZE_PROMPT} from "../../lib/prompts/summarize";
import {ChatCompletionResponse} from "../../lib/types/openai/classifition";

export const generateSummary = async (
  history: string,
): Promise<string | null> => {
  const token = process.env.CLASSIFICATION_API || "";

  const payload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: SUMMARIZE_PROMPT,
      },
      {
        role: "user",
        content: history,
      },
    ],
    temperature: 0,
    top_p: 1,
    max_completion_tokens: 350,
  };

  const {data} = await openAIRequest("/chat/completions", token, payload);
  const response = data as ChatCompletionResponse;

  const summary = response.choices[0].message.content;
  if (!summary) return null;

  console.log({SUMMARY_TOKENS: response.usage.total_tokens.toFixed(1)});

  return summary;
};
