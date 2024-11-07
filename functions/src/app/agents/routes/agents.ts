import * as express from "express";
import {
  handleCustomerSearch,
  handleFetchCustomerOrders,
  handleProductSearch,
  handleInitiateChat,
  handleResponse,
  handleResolveChat,
  handleCloseChat,
  handleTestActions,
} from "../controller/agents";

export const agentsRoutes = (app: express.Router) => {
  app.get("/:domain/customer/:email", handleCustomerSearch);
  app.get("/:domain/customer/:email/orders", handleFetchCustomerOrders);
  app.get("/:domain/products/:query", handleProductSearch);
  app.post("/:domain/initiate/:email", handleInitiateChat);
  app.post("/:domain/respond/:email", handleResponse);
  app.post("/:domain/resolve/:email", handleResolveChat);
  app.post("/:domain/close/:email", handleCloseChat);
  app.post("/:domain/test/:email", handleTestActions);
};
