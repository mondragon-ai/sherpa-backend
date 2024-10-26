import {openAIRequest} from ".";
import {CLASSIFICATION_PROMPT} from "../../lib/prompts/classification";
import {ClassificationTypes} from "../../lib/types/shared";

export const classifyMessageGPT = async (
  messsage: string,
): Promise<ClassificationTypes | null> => {
  const token = process.env.CLASSIFICATION_API || "";

  const payload = {
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: CLASSIFICATION_PROMPT,
      },
      {
        role: "user",
        content: messsage,
      },
    ],
    temperature: 0,
    top_p: 1,
    max_completion_tokens: 5,
  };

  const {data} = await openAIRequest("/chat/completions", token, payload);
  const response = data as ChatCompletionResponse;

  const type = response.choices[0].message.content;
  const types = [
    "ORDER_STATUS",
    "SUBSCRIPTION",
    "GIVEAWAY",
    "ORDER_ADDRESS",
    "GENERAL",
    "DISCOUNT",
    "ORDER_CANCELLATION",
    "ORDER_MODIFICATION",
    "ORDER_REFUND",
    "PRODUCT",
  ];

  if (!types.includes(type.toLocaleUpperCase())) return null;

  return response.choices[0].message.content as ClassificationTypes;
};
