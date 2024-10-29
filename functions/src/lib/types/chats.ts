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
  specific_issue: string;
  edited: boolean;
  suggested_email: string;
  email_sent: boolean;
  manual: boolean;
  manually_triggerd: boolean;
  initial_message: string;
  convo_trained: boolean;
  action_trained: boolean;
  sentiment: RatingTypes | null;

  // chat
  rating: RatingTypes | null;
  classification: ClassificationTypes | null;
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
  suggested_action: SuggestedActions | null;
  customer: null | CustomerData;
  email: null | string;
  updated_at: number;
  created_at: number;
  order: null | OrderData;
};

export type ChatStartRequest = {
  email: string;
  issue: IssueTypes;
  specific_issue: string;
  order_id: string;
  product_id?: string;
};

export type ChatConvoRequest = {
  message: string;
};
