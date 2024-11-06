import {
  fetchSubcollectionDocument,
  updateSubcollectionDocument,
} from "../../../database/firestore";
import {
  getDayStartUnixTimeStampFromTimezone,
  getMonthStartUnixTimeStampFromTimezone,
} from "../../../util/formatters/time";
import {
  appendToCategoryCSAT,
  appendToCSAT,
  appendToError,
  appendToResolutionRatio,
  appendToSentimentAnalysis,
  initResolveTicketAnalytics,
} from "../../payloads/analytics";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {AnalyticsDocument, LineChart} from "../../types/analytics";

export const resolveTicketAnalytics = async (
  type: "chat" | "email",
  chat: ChatDocument | EmailDocument,
) => {
  // update daily
  const daily = await resolveDailyTicketAnalytics(type, chat);
  if (!daily) return false;

  // update Monthly
  const monthly = await resolveMonthlyTicketAnalytics(type, chat);
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

export const resolveDailyTicketAnalytics = async (
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
    daily = initResolveTicketAnalytics(today, type, chat);
  } else {
    const agent = chat.suggested_action ? "sherpa" : "human";
    /* eslint-disable indent */
    const discount_used = chat.suggested_action == "apply_discount";
    const order: LineChart | null = discount_used
      ? {
          date: `${chat.order?.created_at}`,
          value: Number(chat.order?.current_total_price),
        }
      : null;

    daily = {
      ...daily,
      id: today,
      resolution_ratio: appendToResolutionRatio(agent, daily),
      csat: chat.rating ? appendToCSAT(chat.rating, daily) : daily.csat,
      sentiment_analysis: chat.sentiment
        ? appendToSentimentAnalysis(chat.sentiment, daily)
        : daily.sentiment_analysis,
      category_csat:
        chat.classification && chat.rating
          ? appendToCategoryCSAT(chat.classification, chat.rating, daily)
          : daily.category_csat,
      top_errors: chat.classification
        ? appendToError(chat.classification, daily)
        : daily.top_errors,
      updated_at: today,
      amount_saved: order
        ? [...(daily.amount_saved || []), order]
        : daily.amount_saved || [],
    };
    /* eslint-enable indent */
  }
  return daily;
};

export const resolveMonthlyTicketAnalytics = async (
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

  let monthly = data as AnalyticsDocument;

  if (!monthly) {
    monthly = initResolveTicketAnalytics(month, type, chat);
  } else {
    const agent = chat.suggested_action_done ? "sherpa" : "human";
    /* eslint-disable indent */
    const discount_used = chat.suggested_action == "apply_discount";
    const order: LineChart | null = discount_used
      ? {
          date: `${chat.order?.created_at}`,
          value: Number(chat.order?.current_total_price),
        }
      : null;

    monthly = {
      ...monthly,
      id: month,
      resolution_ratio: appendToResolutionRatio(agent, monthly),
      csat: chat.rating ? appendToCSAT(chat.rating, monthly) : monthly.csat,
      sentiment_analysis: chat.sentiment
        ? appendToSentimentAnalysis(chat.sentiment, monthly)
        : monthly.sentiment_analysis,
      category_csat:
        chat.classification && chat.rating
          ? appendToCategoryCSAT(chat.classification, chat.rating, monthly)
          : monthly.category_csat,
      top_errors: chat.classification
        ? appendToError(chat.classification, monthly)
        : monthly.top_errors,
      updated_at: month,
      amount_saved: order
        ? [...(monthly.amount_saved || []), order]
        : monthly.amount_saved || [],
    }; /* eslint-enable indent */
  }
  return monthly;
};
