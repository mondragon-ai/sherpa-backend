import * as express from "express";
import * as functions from "firebase-functions";
import {
  fetchCustomerOrders,
  searchCustomer,
  searchProduct,
  startChat,
  respondToChat,
  resolveChat,
  testActions,
  closeChat,
} from "../services/agents";
import {ChatStartRequest} from "../../../lib/types/chats";

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
export const handleFetchCustomerOrders = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, email} = req.params;
  functions.logger.info(
    ` 🤖 [/CUSTOMER]: Search ${domain} customer ${email} orders`,
  );

  const {status, message, data} = await fetchCustomerOrders(domain, email);

  res.status(status).json({
    message: message,
    data: data,
  });
};

/**
 * Search customer orders by email
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleProductSearch = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, query} = req.params;
  functions.logger.info(` 🤖 [/PRODUCT]: Search ${domain} products: ${query}`);

  const {status, message, data} = await searchProduct(domain, query);

  res.status(status).json({
    message: message,
    data: data,
  });
};

/**
 * Start chat with Agent
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleInitiateChat = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, email} = req.params;
  const payload = req.body.chat;
  functions.logger.info(
    ` 🤖 [/INITIATE]: Start chat for ${domain} and ${email}`,
  );

  const {status, message, data} = await startChat(
    domain,
    email,
    payload as ChatStartRequest,
  );

  res.status(status).json({
    message: message,
    data: data,
  });
};

/**
 * Respond to chat with Agent
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleResponse = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, email} = req.params;
  const msg = req.body.message;
  functions.logger.info(
    ` 🤖 [/RESPOND]: Respond to chat for ${domain} and ${email}`,
  );

  const {status, message, data} = await respondToChat(domain, email, msg);

  res.status(status).json({
    message: message,
    data: data,
  });
};

/**
 * Resolve to chat with Agent
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleResolveChat = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, email} = req.params;
  const {type} = req.query;
  const kind = typeof type === "string" ? type : "";
  functions.logger.info(
    ` 🤖 [/RESOLVE]: Resolve chat for ${domain} and ${email}`,
  );

  const {status, message, data} = await resolveChat(
    domain,
    email,
    kind as "email" | "chat",
  );

  res.status(status).json({
    message: message,
    data: data,
  });
};

/**
 * Close to chat with (manually)
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleCloseChat = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, email} = req.params;
  const {type} = req.query;
  const kind = typeof type === "string" ? type : "";
  functions.logger.info(` 🤖 [/CLOSE]: Close chat for ${domain} and ${email}`);

  const {status, message, data} = await closeChat(
    domain,
    email,
    kind as "email" | "chat",
  );

  res.status(status).json({
    message: message,
    data: data,
  });
};

/**
 * Test actions for chat
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleTestActions = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, email} = req.params;
  functions.logger.info(` 🤖 [/TEST]: Test actions ${domain} and ${email}`);

  const {status, message, data} = await testActions(domain, email);

  res.status(status).json({
    message: message,
    data: data,
  });
};
