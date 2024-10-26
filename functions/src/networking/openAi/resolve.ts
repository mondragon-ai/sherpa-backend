import {openAIRequest} from ".";
import {SUGGESTED_ACTION_PROMPT} from "../../lib/prompts/suggestedAction";
import {SuggestedActions} from "../../lib/types/shared";

export const generateSuggestedActionsGPT = async (
  prompt: string,
): Promise<SuggestedActions | null> => {
  const payload = {
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: SUGGESTED_ACTION_PROMPT,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    top_p: 1,
    max_completion_tokens: 400,
  };

  const token = process.env.SUGGESTED_ACTION_API || "";
  const {data} = await openAIRequest("/chat/completions", token, payload);
  const response = data as ChatCompletionResponse;
  const suggested_action = response.choices[0].message.content;
  if (!suggested_action) return null;

  return suggested_action as SuggestedActions;
};
