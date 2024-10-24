import {
  SuggestedActions,
  Conversation,
  CustomerData,
  IssueTypes,
  RatingTypes,
  ClassificationTypes,
  OrderData,
} from "./shared";

export type EmailDocument = {
  rating: RatingTypes;
  classification: ClassificationTypes;
  issue: IssueTypes;
  suggested_action_done: boolean;
  source: "gmail" | "outlook";
  history_id: string;
  thread: EmailMessage[];
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
  summary: string;
  order: null | OrderData;
  //
  email_sent: boolean;
};

export type EmailMessage = {
  id: string;
  threadId: string;
  internalDate: string;
  sender: "agent" | "customer";
  from: string;
  to: string;
  subject: string;
  message: string;
  image: any[];
};
