import * as express from "express";
import {
  handleCustomerSearch,
  handleFetchCustomerOrders,
  handleProductSearch,
  handleInitiateChat,
} from "../controller/agents";

export const agentsRoutes = (app: express.Router) => {
  app.get("/:domain/customer/:email", handleCustomerSearch);
  app.get("/:domain/customer/:email/orders", handleFetchCustomerOrders);
  app.get("/:domain/products/:query", handleProductSearch);
  app.post("/:domain/initiate/:email", handleInitiateChat);
  app.post("/:domain/respond");
  app.post("/:domain/resolve");
};
