import * as express from "express";
import * as functions from "firebase-functions";
import {fetchConfigs, updateConfigs} from "../services/configuration";

/**
 * Fetch bot config from DB
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to return the merchant data.
 */
export const handleFetchConfigs = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  functions.logger.info(` 🎛️ [/FETCH]: Fetch configs for ${domain}`);

  const {data, status, message} = await fetchConfigs(domain);

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
export const handleUpdateConfigs = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  const payload = req.body.configurations;
  functions.logger.info(` 🎛️ [/UPDATE]: Update/Save configs for ${domain}`);

  const {status, message} = await updateConfigs(domain, payload);

  res.status(status < 300 ? 204 : status).json({
    message: message,
    data: null,
  });
};
