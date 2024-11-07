import * as express from "express";
import * as functions from "firebase-functions";
import {
  gmailCallback,
  initiateAuth,
  sendGmailEmail,
  fetchEmails,
  subscribeToGmail,
  testSubPub,
  removeGmail,
} from "../services/gmail";

/**
 * Initiate oAuth Gmail
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleAuthGmail = async (
  req: express.Request,
  res: express.Response,
) => {
  const domain = req.params.domain as string;
  functions.logger.info(` 📧 [/AUTH]: initiate Gmail oAuth for ${domain}`);

  const {data, message, status} = await initiateAuth(domain);

  console.log(data, message, status);
  res.status(200).json({url: data});
  // res.redirect(data);
};

/**
 * Callback for oAuth Gmail
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleCallback = async (
  req: express.Request,
  res: express.Response,
) => {
  const {code, state} = req.query;
  const token = typeof code === "string" ? code : "";
  const domain = typeof state === "string" ? state : req.hostname;
  functions.logger.info(` 📧 [/CALLBACK]: Gmail oAuth Callback for ${domain}`);

  if (!token) res.status(401).send("Authorization code missing.");

  await gmailCallback(domain, token);

  // res.status(status).json({data, message});
  res.redirect(
    `https://admin.shopify.com/store/${
      domain.split(".")[0]
    }/apps/sherpa-dev-1/app/integrate`,
  );
};

/**
 * Send email on behalf of gmail client
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleSendEmail = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, type} = req.params;
  const {to, subject, email} = req.body;
  functions.logger.info(` 📧 [/SEND]: Send email for ${domain} to ${to}`);

  const {data, status, message} = await sendGmailEmail(
    domain,
    to,
    subject,
    email,
    type as any,
  );

  res.status(status).json({data, message});
};

/**
 * Receive email on behalf of gmail client
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleReceiveEmails = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  const {time} = req.query;
  const seconds = typeof time === "string" ? time : "";
  functions.logger.info(` 📧 [/FETCH]: Fetch emails from gmail for ${domain}`);

  const {data, status, message} = await fetchEmails(domain, seconds);

  res.status(status).json({data, message});
};

/**
 * Subscribe received emails to Pub/Sub (Gmail)
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleSubscription = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  functions.logger.info(
    ` 📧 [/SUBSCRIBE]: Subscribe received emails for ${domain}`,
  );

  const {status, message, data} = await subscribeToGmail(domain);

  res.status(status).json({
    message: message,
    data: data,
  });
};

/**
 * Test Pub/Sub (Gmail)
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleTestPubSub = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, email} = req.params;
  const {id} = req.query;
  const history_id = typeof id == "string" ? id : "";
  functions.logger.info(` 📧 [/TEST]: Test Pub/Sub ${domain}`);

  const {status, message, data} = await testSubPub(
    domain,
    email,
    Number(history_id),
  );

  res.status(status).json({
    message: message,
    data: data,
  });
};

/**
 * Remove Email
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleRemoveGmail = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  functions.logger.info(` 📧 [/REMOVE]: Remove Gmail App ${domain}`);

  const {status, message, data} = await removeGmail(domain);

  res.status(status).json({
    message: message,
    data: data,
  });
};
