import * as express from "express";
import * as functions from "firebase-functions";
import {
  deleteEmail,
  fetchEmails,
  fetchNextEmails,
  filterEmails,
} from "../services/emails";

/**
 * Fetch Emails from DB
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to return the merchant data.
 */
export const handleFetchAllEmails = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  functions.logger.info(" 📧 [/FETCH]: " + domain + " ");

  const {data, status, message} = await fetchEmails(domain);

  res.status(status).json({
    message: message,
    data: data,
  });
};

/**
 * Fetch next Emails from DB (infinity scroll pagination)
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to return the merchant data.
 */
export const handleFetchNextEmails = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, time} = req.params;
  functions.logger.info(
    " 📧 [/FETCH NEXT]: Fetch more Emails " + domain + " from " + time,
  );

  const {data, status, message} = await fetchNextEmails(domain, time);

  res.status(status).json({
    message: message,
    data: data,
  });
};

/**
 * Fetch next Emails from DB (infinity scroll pagination)
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to return the merchant data.
 */
export const handleFilteredEmails = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  const {type} = req.query;
  const filter = typeof type == "string" ? type : "";
  functions.logger.info(
    " 📧 [/FETCH NEXT]: Fetch filtered Emails for " + domain + " for " + filter,
  );

  const {data, status, message} = await filterEmails(
    domain,
    filter as "newest" | "open" | "action_required",
  );

  res.status(status).json({
    message: message,
    data: data,
  });
};
/**
 * Delete a specific email
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleDeleteEmail = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, id} = req.params;
  functions.logger.info(` 📧 [/DELETE]: Delete email ${id} for ${domain}`);

  const {status, message} = await deleteEmail(domain, id);

  res.status(status < 300 ? 201 : status).json({
    message: message,
    data: null,
  });
};
