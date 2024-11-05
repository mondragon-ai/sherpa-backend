import * as express from "express";
import * as functions from "firebase-functions";
import {fetchAnalytics, fetchSearchedAnalytics} from "../services/analytics";
import {TimeFrameTypes} from "../../../lib/types/analytics";

/**
 * Fetch analytics from DB
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to return the merchant data.
 */
export const handleFetchAnalytics = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  const {tz} = req.query;
  const timezone = typeof tz == "string" ? tz : "";
  functions.logger.info(` 📊 [/FETCH]: Fetch anlaytics for ${domain}`);

  const {data, status, message} = await fetchAnalytics(domain, timezone);

  res.status(status).json({
    message: message,
    data: data,
  });
};

export const handleSearchingAnalytics = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  const {tz, tf} = req.query;
  const time_frame = typeof tf == "string" ? tf : "";
  const timezone = typeof tz == "string" ? tz : "";
  functions.logger.info(
    ` 📊 [/FETCH]: Fetch anlaytics for ${domain} for ${time_frame}`,
  );

  const {data, status, message} = await fetchSearchedAnalytics(
    domain,
    time_frame as TimeFrameTypes,
    timezone,
  );

  res.status(status).json({
    message: message,
    data: data,
  });
};
