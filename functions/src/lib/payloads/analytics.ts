import {AnalyticsDocument, LineChart} from "../types/analytics";
import {ChatDocument} from "../types/chats";
import {EmailDocument} from "../types/emails";
import {ClassificationTypes, IssueTypes} from "../types/shared";

export const initCreateTicketAnalytics = (
  time: number,
  type: "chat" | "email",
  chat?: ChatDocument | EmailDocument,
) => {
  if (!chat) {
    const analytics: AnalyticsDocument = {
      id: time,
      total_chats: [],
      total_emails: [],
      total_volume: [],
      resolution_ratio: {sherpa: 0, human: 0},
      csat: {positive: 0, negative: 0, neutral: 0},
      sentiment_analysis: {positive: 0, negative: 0, neutral: 0},
      category_csat: {},
      top_errors: {},
      top_issues: {},
      top_tickets: {},
      created_at: time,
      updated_at: time,
      amount_saved: [],
    };

    return analytics;
  }
  const new_ticket = [{date: `${chat.updated_at}`, value: 1}] as LineChart[];

  const analytics: AnalyticsDocument = {
    id: time,
    total_chats: type == "chat" ? new_ticket : [],
    total_emails: type == "email" ? new_ticket : [],
    total_volume: new_ticket,
    resolution_ratio: {sherpa: 0, human: 0},
    csat: {positive: 0, negative: 0, neutral: 0},
    sentiment_analysis: {positive: 0, negative: 0, neutral: 0},
    category_csat: {},
    top_errors: {},
    top_issues: {[chat.issue || "unknown"]: 1},
    top_tickets: {[chat.classification || "unknown"]: 1},
    created_at: time,
    updated_at: time,
    amount_saved: [],
  };

  return analytics;
};

export const initResolveTicketAnalytics = (
  time: number,
  type: "chat" | "email",
  chat: ChatDocument | EmailDocument,
) => {
  const new_ticket = [{date: `${chat.updated_at}`, value: 1}] as LineChart[];

  /* eslint-disable indent */
  const discount_used = chat.suggested_action == "apply_discount";
  const order: LineChart | null = discount_used
    ? {
        date: `${chat.order?.created_at}`,
        value: Number(chat.order?.current_total_price),
      }
    : null;

  const analytics: AnalyticsDocument = {
    id: time,
    total_chats: type === "chat" ? new_ticket : [],
    total_emails: type === "email" ? new_ticket : [],
    total_volume: new_ticket,
    resolution_ratio: chat.suggested_action_done
      ? {sherpa: 1, human: 0}
      : {sherpa: 0, human: 1},
    csat: chat.rating
      ? {
          positive: chat.rating === "positive" ? 1 : 0,
          negative: chat.rating === "negative" ? 1 : 0,
          neutral: chat.rating === "neutral" ? 1 : 0,
        }
      : {positive: 0, negative: 0, neutral: 0},
    sentiment_analysis: chat.sentiment
      ? {
          positive: chat.sentiment === "positive" ? 1 : 0,
          negative: chat.sentiment === "negative" ? 1 : 0,
          neutral: chat.sentiment === "neutral" ? 1 : 0,
        }
      : {positive: 0, negative: 0, neutral: 0},
    category_csat:
      chat.rating && chat.classification
        ? {
            [chat.classification]: {
              positive: chat.rating === "positive" ? 1 : 0,
              negative: chat.rating === "negative" ? 1 : 0,
              neutral: chat.rating === "neutral" ? 1 : 0,
            },
          }
        : {},
    top_errors: chat.error_info ? {[chat.error_info]: 1} : {},
    top_issues: chat.issue ? {[chat.issue]: 1} : {unknown: 1},
    top_tickets: chat.classification
      ? {[chat.classification]: 1}
      : {unknown: 1},
    created_at: time,
    updated_at: time,
    amount_saved: order ? [order] : [],
  };
  /* eslint-enable indent */

  return analytics;
};

export const appendToTopIssues = (
  issue: IssueTypes,
  analaytics: AnalyticsDocument,
) => {
  const top_issues = {[issue]: 1} as {[key in IssueTypes]: number};

  for (const [x, v] of Object.entries(analaytics.top_issues)) {
    if (top_issues[x as IssueTypes]) {
      top_issues[x as IssueTypes] = v + 1;
    } else {
      top_issues[x as IssueTypes] = 1;
    }
  }

  return top_issues;
};

export const appendToTickets = (
  classification: ClassificationTypes,
  analaytics: AnalyticsDocument,
) => {
  const top_ticket = {[classification]: 1} as {
    [key in ClassificationTypes]: number;
  };

  for (const [x, v] of Object.entries(analaytics.top_tickets)) {
    if (top_ticket[x as ClassificationTypes]) {
      top_ticket[x as ClassificationTypes] = v + 1;
    } else {
      top_ticket[x as ClassificationTypes] = 1;
    }
  }

  return top_ticket;
};

export const appendToError = (
  error: ClassificationTypes,
  analaytics: AnalyticsDocument,
) => {
  const top_error = {[error]: 1} as {
    [key in ClassificationTypes]: number;
  };

  for (const [x, v] of Object.entries(analaytics.top_errors)) {
    if (top_error[x as ClassificationTypes]) {
      top_error[x as ClassificationTypes] = v + 1;
    } else {
      top_error[x as ClassificationTypes] = 1;
    }
  }

  return top_error;
};

// Append to resolution ratio by incrementing either sherpa or human counts
export const appendToResolutionRatio = (
  resolvedBy: "sherpa" | "human",
  analytics: AnalyticsDocument,
) => {
  const resolution_ratio = {...analytics.resolution_ratio};
  resolution_ratio[resolvedBy] = (resolution_ratio[resolvedBy] || 0) + 1;
  return resolution_ratio;
};

// Append to CSAT by incrementing positive, negative, or neutral counts
export const appendToCSAT = (
  csatType: "positive" | "negative" | "neutral",
  analytics: AnalyticsDocument,
) => {
  const csat = {...analytics.csat};
  csat[csatType] = (csat[csatType] || 0) + 1;
  return csat;
};

// Append to sentiment analysis by incrementing positive, negative, or neutral counts
export const appendToSentimentAnalysis = (
  sentiment: "positive" | "negative" | "neutral",
  analytics: AnalyticsDocument,
) => {
  const sentiment_analysis = {...analytics.sentiment_analysis};
  sentiment_analysis[sentiment] = (sentiment_analysis[sentiment] || 0) + 1;
  return sentiment_analysis;
};

// Append to category CSAT by updating the CSAT rating for a specific category
export const appendToCategoryCSAT = (
  category: string,
  rating: "positive" | "negative" | "neutral",
  analytics: AnalyticsDocument,
) => {
  const category_csat = {...analytics.category_csat};
  if (!category_csat[category]) {
    category_csat[category] = {positive: 0, negative: 0, neutral: 0};
  }
  category_csat[category][rating] += 1;
  return category_csat;
};
