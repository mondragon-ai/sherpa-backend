import {
  fetchSubcollectionDocument,
  updateSubcollectionDocument,
} from "../../../database/firestore";
import {
  getDayStartUnixTimeStampFromTimezone,
  getMonthStartUnixTimeStampFromTimezone,
} from "../../../util/formatters/time";
import {
  appendToTopIssues,
  initCreateTicketAnalytics,
} from "../../payloads/analytics";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {AnalyticsDocument, LineChart} from "../../types/analytics";

export const createTicketAnalytics = async (
  type: "chat" | "email",
  chat: ChatDocument | EmailDocument,
) => {
  // update daily
  const daily = await createDailyTicketAnalytics(type, chat);
  if (!daily) return false;

  // update Monthly
  const monthly = await createMonthlyTicketAnalytics(type, chat);
  if (!monthly) return false;

  // Save both -> true
  const today = getDayStartUnixTimeStampFromTimezone(chat.timezone);
  await updateSubcollectionDocument(
    "shopify_merchant",
    chat.domain,
    "daily_analytics",
    String(today),
    daily,
  );

  const month = getMonthStartUnixTimeStampFromTimezone(chat.timezone);
  await updateSubcollectionDocument(
    "shopify_merchant",
    chat.domain,
    "monthly_analytics",
    String(month),
    monthly,
  );

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

  const daily = data as AnalyticsDocument;

  if (!daily) {
    return initCreateTicketAnalytics(today, type, chat);
  } else {
    const new_ticket = {date: `${chat.updated_at}`, value: 1} as LineChart;

    return {
      ...daily,
      id: today,
      total_chats:
        type == "chat" ? [...daily.total_chats, new_ticket] : daily.total_chats,
      total_emails:
        type == "email"
          ? [...daily.total_emails, new_ticket]
          : daily.total_emails,
      total_volume: [...daily.total_volume, new_ticket],
      top_issues: chat.issue
        ? appendToTopIssues(chat.issue, daily)
        : daily.top_issues,
      created_at: today,
      updated_at: today,
    };
  }
};

export const createMonthlyTicketAnalytics = async (
  type: "chat" | "email",
  chat: ChatDocument | EmailDocument,
) => {
  const month = getMonthStartUnixTimeStampFromTimezone(chat.timezone);

  const {data} = await fetchSubcollectionDocument(
    "shopify_merchant",
    chat.domain,
    "monthly_analytics",
    `${month}`,
  );

  const monthly = data as AnalyticsDocument;

  if (!monthly) {
    return initCreateTicketAnalytics(month, type, chat);
  } else {
    const new_ticket = {date: `${chat.updated_at}`, value: 1} as LineChart;

    return {
      ...monthly,
      id: month,
      total_chats:
        type == "chat"
          ? [...monthly.total_chats, new_ticket]
          : monthly.total_chats,
      total_emails:
        type == "email"
          ? [...monthly.total_emails, new_ticket]
          : monthly.total_emails,
      total_volume: [...monthly.total_volume, new_ticket],
      top_issues: chat.issue
        ? appendToTopIssues(chat.issue, monthly)
        : monthly.top_issues,
      created_at: month,
      updated_at: month,
    };
  }
  return monthly;
};
