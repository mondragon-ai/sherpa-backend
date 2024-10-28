import {AnalyticsDocument, LineChart} from "../types/analytics";
import {ChatDocument} from "../types/chats";
import {EmailDocument} from "../types/emails";

export const initCreateTicketAnalytics = (
  time: number,
  type: "chat" | "email",
  chat: ChatDocument | EmailDocument,
) => {
  const new_ticket = [{date: `${chat.updated_at}`, value: 1}] as LineChart[];

  const analytics: AnalyticsDocument = {
    id: time,
    total_chats: type == "chat" ? new_ticket : [],
    total_emails: type == "email" ? new_ticket : [],
    total_volume: new_ticket,
    resolution_ratio: {sherpa: 0, human: 0},
    csat: {positive: 0, negative: 0, neutral: 0},
    sentiment_analysis: {positive: 0, negative: 0, neutral: 0},
    top_errors: {},
    top_issues: {[chat.issue || "none"]: 1},
    top_tickets: {[chat.classification || "none"]: 1},
    created_at: time,
    updated_at: time,
  };

  return analytics;
};
