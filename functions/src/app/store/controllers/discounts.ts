import * as express from "express";
import * as functions from "firebase-functions";
import {createDiscount, deleteDiscountRule} from "../services/discounts";

/**
 * Create Discount price rule
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to return the merchant data.
 */
export const handleCreateDiscounts = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  const payload = req.body.discounts;
  functions.logger.info(` 🎟️ [/CREATE]: Create discount rule for ${domain}`);

  const {data, status, message} = await createDiscount(domain, payload);

  res.status(status).json({
    message: message,
    data: data,
  });
};

/**
 * Update bot config
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleDeleteDiscount = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, token} = req.params;
  const {id} = req.query;
  const rule_id = typeof id === "string" ? id : "";
  functions.logger.info(
    ` 🎟️ [/DELETE]: Delete discount rule ${rule_id} for ${domain}`,
  );

  const {status, message} = await deleteDiscountRule(domain, token, rule_id);

  res.status(status < 300 ? 204 : status).json({
    message: message,
    data: null,
  });
};
