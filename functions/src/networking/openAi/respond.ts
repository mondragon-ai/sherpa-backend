import {openAIRequest} from ".";

type BlockType = {
  role: "user" | "system" | "assistant";
  content: string;
};

export const respondToChatGPT = async (
  messsage: string,
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

  return agent;
};
