import {
  analyticsSearch,
  fetchSubcollectionDocument,
} from "../../../database/firestore";
import {initCreateTicketAnalytics} from "../../../lib/payloads/analytics";
import {AnalyticsDocument, TimeFrameTypes} from "../../../lib/types/analytics";
import {createResponse} from "../../../util/errors";
import {
  getDayStartUnixTimeStampFromTimezone,
  getMonthStartUnixTimeStampFromTimezone,
} from "../../../util/formatters/time";

export const fetchAnalytics = async (domain: string, timezone: string) => {
  if (!domain || !timezone) return createResponse(400, "Missing Domain", null);

  const today = getDayStartUnixTimeStampFromTimezone(timezone);
  const {data} = await fetchSubcollectionDocument(
    "shopify_merchant",
    domain,
    "daily_analytics",
    `${today}`,
  );
  const analytics = data as AnalyticsDocument;
  if (!analytics) return createResponse(422, "No analytics found", null);

  return createResponse(200, "Fetched Analytics", {analytics: [analytics]});
};

export const fetchSearchedAnalytics = async (
  domain: string,
  tf: TimeFrameTypes,
  timezone: string,
) => {
  if (!tf || !domain || !timezone) {
    return createResponse(400, "TF Required", null);
  }

  const today = getDayStartUnixTimeStampFromTimezone(timezone);
  const month = getMonthStartUnixTimeStampFromTimezone(timezone);

  switch (tf) {
    case "today": {
      const {data} = await fetchSubcollectionDocument(
        "shopify_merchant",
        domain,
        "daily_analytics",
        `${today}`,
      );
      const analytics = data as AnalyticsDocument[];
      if (!analytics) {
        const payload = initCreateTicketAnalytics(today, "chat");
        return createResponse(201, "Created Anlaytics", {
          analytics: [payload],
        });
      }

      return createResponse(200, "Fetched Today", {
        analytics: [analytics],
      });
    }

    case "seven_days": {
      const time = Math.abs(Math.round(today - 60 * 60 * 24 * 7));
      console.log({time});

      const {data} = await analyticsSearch(
        "shopify_merchant",
        domain,
        "daily_analytics",
        `${time}`,
      );
      const analytics = data as AnalyticsDocument[];
      if (!analytics) {
        const payload = initCreateTicketAnalytics(today, "chat");
        return createResponse(201, "Created Anlaytics", {
          analytics: [payload],
        });
      }

      return createResponse(200, "Fetched 7 Days", {
        analytics: analytics,
      });
    }

    case "thirty_days": {
      const time = Math.abs(Math.round(today - 60 * 60 * 24 * 30));
      console.log({time});

      const {data} = await analyticsSearch(
        "shopify_merchant",
        domain,
        "daily_analytics",
        `${time}`,
      );
      const analytics = data as AnalyticsDocument[];
      if (!analytics) {
        const payload = initCreateTicketAnalytics(today, "chat");
        return createResponse(201, "Created Anlaytics", {
          analytics: [payload],
        });
      }

      return createResponse(200, "Fetched 30 Days", {
        analytics: analytics,
      });
    }

    case "ninety_days": {
      const time = Math.abs(Math.round(today - 60 * 60 * 24 * 90));

      const {data} = await analyticsSearch(
        "shopify_merchant",
        domain,
        "daily_analytics",
        `${time}`,
      );
      const analytics = data as AnalyticsDocument[];
      if (!analytics) {
        const payload = initCreateTicketAnalytics(today, "chat");
        return createResponse(201, "Created Anlaytics", {
          analytics: [payload],
        });
      }

      return createResponse(200, "Fetched 90 Days", {
        analytics: analytics,
      });
    }

    case "twelve_months": {
      const time = Math.abs(Math.round(today - 60 * 60 * 24 * 365));

      const {data} = await analyticsSearch(
        "shopify_merchant",
        domain,
        "monthly_analytics",
        `${time}`,
      );
      const analytics = data as AnalyticsDocument[];
      if (!analytics) {
        const payload = initCreateTicketAnalytics(month, "chat");
        return createResponse(201, "Created Anlaytics", {
          analytics: [payload],
        });
      }

      return createResponse(200, "Fetched 12 Months", {
        analytics: analytics,
      });
    }

    default: {
      const {data} = await fetchSubcollectionDocument(
        "shopify_merchant",
        domain,
        "daily_analytics",
        `${today}`,
      );
      const analytics = data as AnalyticsDocument[];
      if (!analytics) {
        const payload = initCreateTicketAnalytics(today, "chat");
        return createResponse(201, "Created Anlaytics", {
          analytics: [payload],
        });
      }

      return createResponse(200, "Fetched Today", {
        analytics: [analytics],
      });
    }
  }
};
