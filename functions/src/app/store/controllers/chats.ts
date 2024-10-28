import * as express from "express";
import * as functions from "firebase-functions";
import {
  deleteChat,
  fetchChats,
  fetchNextChats,
  filterChats,
  rateChat,
  submitNote,
} from "../services/chats";

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
 * Fetch next chats from DB (infinity scroll pagination)
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to return the merchant data.
 */
export const handleFetchNextChats = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, time} = req.params;
  functions.logger.info(
    " 💬 [/FETCH NEXT]: Fetch more chats " + domain + " from " + time,
  );

  const {data, status, message} = await fetchNextChats(domain, time);

  res.status(status).json({
    message: message,
    data: data,
  });
};

/**
 * Fetch filtered chats from DB (infinity scroll pagination)
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to return the merchant data.
 */
export const handleFilteredChats = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  const {type} = req.query;
  const filter = typeof type == "string" ? type : "";
  functions.logger.info(
    " 💬 [/FETCH FILTERED] Fetch filtered: " + filter + " for " + domain,
  );

  const {data, status, message} = await filterChats(
    domain,
    filter as "newest" | "open" | "action_required",
  );

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

  res.status(status).json({
    message: message,
    data: null,
  });
};

/**
 * Rate Chat
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleRateChat = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, id} = req.params;
  const {rating} = req.query;
  const score = typeof rating == "string" ? rating : "";
  functions.logger.info(` 💬 [/RATE]: Rate chat ${id} ${score} for ${domain}`);

  const {status, message} = await rateChat(
    domain,
    id,
    score as "postive" | "negative" | "neutral",
  );

  res.status(status).json({
    message: message,
    data: null,
  });
};

/**
 * Rate Chat
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleAddNote = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, id} = req.params;
  const {note} = req.body;
  functions.logger.info(` 💬 [/NOTE]: Add chat note ${id} for ${domain}`);

  const {status, message} = await submitNote(domain, id, note);

  res.status(status).json({
    message: message,
    data: null,
  });
};
