export type ChatCompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
  system_fingerprint: string;
};

type Choice = {
  index: number;
  message: Message;
  logprobs: LogProbs | null;
  finish_reason: string;
};

type Message = {
  role: string;
  content: string;
  refusal: string | null;
};

type LogProbs = {
  tokens: string[];
  token_logprobs: number[];
  top_logprobs: Record<string, number>[];
  text_offset: number[];
};

type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details: TokenDetails;
  completion_tokens_details: TokenDetails;
};

type TokenDetails = {
  cached_tokens: number;
  reasoning_tokens?: number; // Optional as it may or may not be present
};
