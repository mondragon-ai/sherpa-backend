import * as express from "express";
import * as functions from "firebase-functions";
import {searchCustomer} from "../services/agents";

/**
 * Search customer by email
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleCustomerSearch = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, email} = req.params;
  functions.logger.info(` 🤖 [/CUSTOMER]: Search ${domain} customer ${email}`);

  const {status, message, data} = await searchCustomer(domain, email);

  res.status(status).json({
    message: message,
    data: data,
  });
};

/**
 * Search customer by email
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleProductSearch = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, email} = req.params;
  functions.logger.info(` 🤖 [/CUSTOMER]: Search ${domain} customer ${email}`);

  const {status, message, data} = await searchCustomer(domain, email);

  res.status(status).json({
    message: message,
    data: data,
  });
};
