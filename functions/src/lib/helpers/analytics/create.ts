import {fetchSubcollectionDocument} from "../../../database/firestore";
import {getDayStartUnixTimeStampFromTimezone} from "../../../util/formatters/time";
import {initCreateTicketAnalytics} from "../../payloads/analytics";
import {AnalyticsDocument, LineChart} from "../../types/analytics";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";

export const createTicketAnalytics = (
  type: "chat" | "email",
  chat: ChatDocument | EmailDocument,
) => {
  // TODO: update daily -> daily
  // TODO: update Monthly -> monthly

  // TODO: Save both -> true
  return true;
};

export const createDailyTicketAnalytics = async (
  type: "chat" | "email",
  chat: ChatDocument | EmailDocument,
) => {
  const today = getDayStartUnixTimeStampFromTimezone(chat.timezone);

  const {data} = await fetchSubcollectionDocument(
    "shopify_merchant",
    chat.domain,
    "daily_analytics",
    `${today}`,
  );

  let daily = data as AnalyticsDocument;

  if (!daily) {
    daily = initCreateTicketAnalytics(today, type, chat);
  } else {
    const new_ticket = {date: `${chat.updated_at}`, value: 1} as LineChart;

    daily = {
      id: today,
      total_chats:
        type == "chat" ? [...daily.total_chats, new_ticket] : daily.total_chats,
      total_emails:
        type == "email"
          ? [...daily.total_emails, new_ticket]
          : daily.total_emails,
      total_volume: [...daily.total_volume, new_ticket],
      resolution_ratio: {sherpa: 0, human: 0},
      csat: {positive: 0, negative: 0, neutral: 0},
      sentiment_analysis: {positive: 0, negative: 0, neutral: 0},
      top_errors: {},
      top_issues: {[chat.issue || "none"]: 1},
      top_tickets: {[chat.classification || "none"]: 1},
      created_at: today,
      updated_at: today,
    };
  }
};
