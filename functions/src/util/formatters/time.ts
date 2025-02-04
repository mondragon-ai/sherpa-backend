import {DateTime} from "luxon";

/**
 * Get the midnight (00:00:00) Unix timestamp for the start of the month given a timezone.
 *
 * @param timezone - The timezone to use for calculating the Unix timestamp.
 * @returns A Promise that resolves to the Unix timestamp of the midnight for the start of the month in the given timezone.
 */
export const getMonthStartUnixTimeStampFromTimezone = (
  timezone: string,
): number => {
  try {
    const monthStart = DateTime.now().setZone(timezone).startOf("month");
    const unixTimestamp = monthStart.toSeconds();
    return unixTimestamp;
  } catch (error) {
    console.error(
      `Error getting start of month timestamp for timezone ${timezone}: `,
      error,
    );
    throw error;
  }
};

/**
 * Get the midnight (00:00:00) Unix timestamp for the given timezone.
 *
 * @param timezone - The timezone to use for calculating the Unix timestamp.
 * @returns A Promise that resolves to the Unix timestamp of the midnight for the given timezone.
 */
export const getDayStartUnixTimeStampFromTimezone = (
  timezone: string,
): number => {
  try {
    const midnight = DateTime.now().setZone(timezone).startOf("day");
    const unixTimestamp = midnight.toSeconds();
    return unixTimestamp;
  } catch (error) {
    console.error(
      `Error getting current timestamp for timezone ${timezone}: `,
      error,
    );
    throw error;
  }
};

/**
 * Get the current Unix timestamp for the given timezone.
 *
 * @param timezone - The timezone to use for calculating the Unix timestamp.
 * @returns A Promise that resolves to the Unix timestamp for the current time in the given timezone.
 */
export const getCurrentUnixTimeStampFromTimezone = (
  timezone: string,
): number => {
  try {
    const currentDateTime = DateTime.now().setZone(timezone);
    const unixTimestamp = currentDateTime.toSeconds();
    return Math.round(unixTimestamp);
  } catch (error) {
    console.error(
      `Error getting current timestamp for timezone ${timezone}: `,
      error,
    );
    throw error;
  }
};

export const addThirtyDays = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 30);
  return date.toISOString().replace("Z", "");
};

export const getHoursDifference = (timeString: number): string => {
  const inputTime = new Date(timeString * 1000);
  if (isNaN(inputTime.getTime())) {
    throw new Error("Invalid date format");
  }

  const currentTime = new Date();

  const diffMilliseconds = currentTime.getTime() - inputTime.getTime();

  const diffHours = Math.round(diffMilliseconds / (1000 * 60 * 60));
  const diffMin = Math.round(diffMilliseconds / (1000 * 60));

  if (diffHours >= 720) {
    return `${(diffHours / 720).toFixed(0)}M`;
  }

  if (diffHours >= 168 && diffHours < 720) {
    return `${(diffHours / 168).toFixed(0)}w`;
  }

  if (diffHours > 72 && diffHours < 168) {
    return `${(diffHours / 24).toFixed(0)}d`;
  }

  if (diffMin < 60) {
    return `${Math.abs(diffMin).toFixed(0)}m`;
  }

  return `${diffHours.toFixed(0)}h`;
};
