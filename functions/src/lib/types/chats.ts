import {
  ClassificationTypes,
  Conversation,
  CustomerData,
  IssueTypes,
  OrderData,
  RatingTypes,
  SuggestedActions,
} from "./shared";

export type ChatDocument = {
  edited: boolean;
  suggested_email: string;
  email_sent: boolean;
  manual: boolean;
  initial_message: string;
  convo_trained: boolean;
  action_trained: boolean;

  // chat
  rating: RatingTypes;
  classification: ClassificationTypes;
  issue: IssueTypes;
  suggested_action_done: boolean;
  summary: string;
  error_info: string;
  timezone: string;
  domain: string;
  id: string;
  conversation: Conversation[];
  time: number;
  status: "open" | "resolved" | "action_required";
  suggested_action: SuggestedActions;
  customer: null | CustomerData;
  email: null | string;
  updated_at: number;
  created_at: number;
  order: null | OrderData;
};
