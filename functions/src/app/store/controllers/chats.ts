import * as express from "express";
import * as functions from "firebase-functions";
import {deleteChat, fetchChats} from "../services/chats";

/**
 * Fetch chats from DB
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to return the merchant data.
 */
export const handleFetchAllChats = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  functions.logger.info(" 💬 [/FETCH]: " + domain + " ");

  const {data, status, message} = await fetchChats(domain);

  res.status(status).json({
    message: message,
    data: data,
  });
};

/**
 * Delete a specific chat
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleDeleteChat = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, id} = req.params;
  functions.logger.info(` 💬 [/DELETE]: Delete chat ${id} for ${domain}`);

  const {status, message} = await deleteChat(domain, id);

  res.status(status < 300 ? 204 : status).json({
    message: message,
    data: null,
  });
};
