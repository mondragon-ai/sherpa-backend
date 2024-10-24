import * as express from "express";
import * as functions from "firebase-functions";
import {installApp, updateBilling} from "../services/merchant";

/**
 * Install the App for the store
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to return the merchant data.
 */
export const handleInstallingApp = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, shpat} = req.params;
  functions.logger.info(" ⬇️ [/INSTALL]: " + domain + " " + shpat);

  // Install App
  const {data, status, text} = await installApp(domain, shpat);

  res.status(status).json({
    text: text,
    merchant: data,
  });
};

/**
 * Update teh billing for the app (approve | increase)
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleUpdatingBilling = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  const {payment_status, capped_amount} = req.body;
  functions.logger.info(
    " 💰 [/BILLING]: " + domain + " " + capped_amount + " " + payment_status,
  );

  // Update Billing
  const {status, text, error} = await updateBilling(
    domain,
    payment_status,
    capped_amount,
  );

  res.status(status < 300 ? 204 : status).json({text, error});
};
