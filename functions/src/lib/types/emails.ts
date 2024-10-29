import {
  SuggestedActions,
  CustomerData,
  IssueTypes,
  RatingTypes,
  ClassificationTypes,
  OrderData,
} from "./shared";

export type EmailDocument = {
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
  issue: IssueTypes | null;
  suggested_action_done: boolean;
  summary: string;
  error_info: string;
  timezone: string;
  domain: string;
  id: string;
  conversation: EmailConversation[];
  time: number;
  status: "open" | "resolved" | "action_required";
  suggested_action: SuggestedActions | null;
  customer: null | CustomerData;
  email: null | string;
  updated_at: number;
  created_at: number;
  order: null | OrderData;
  source: "gmail" | "outlook";
  history_id: string;
};

export type EmailConversation = {
  time: number;
  is_note: boolean;
  action: null | "closed" | "opened";
  sender: "agent" | "customer";
  id: string;
  history_id: string;
  internal_date: string;
  from: string;
  subject: string;
  message: string;
  attachments: any[];
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

export type EmailMap = {
  domain: string;
  id: string;
};
