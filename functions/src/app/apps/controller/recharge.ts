import * as express from "express";
import * as functions from "firebase-functions";
import {removeToken, saveToken} from "../services/recharge";

/**
 * Handle saving Recharge Token
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleSaveRecharge = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, at} = req.params;
  functions.logger.info(` 💳 [/SAVE]: saving Recharge Token for ${domain}`);

  const {status, data, message} = await saveToken(domain, at);

  res.status(status).json({message, data});
};

/**
 * Handle removing Recharge Token
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleRemoveRecharge = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, at} = req.params;
  functions.logger.info(
    ` 💳  [/REMOVE]: Removing Recharge Token for ${domain}`,
  );

  const {status, data, message} = await removeToken(domain, at);

  res.status(status).json({message, data});
};
