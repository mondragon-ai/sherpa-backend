import * as express from "express";
import {
  handleCustomerSearch,
  handleFetchCustomerOrders,
  handleProductSearch,
} from "../controller/agents";

export const agentsRoutes = (app: express.Router) => {
  app.get("/:domain/customer/:email", handleCustomerSearch);
  app.get("/:domain/customer/:email/orders", handleFetchCustomerOrders);
  app.get("/:domain/products/:query", handleProductSearch);
  app.post("/:domain/initiate");
  app.post("/:domain/respond");
  app.post("/:domain/resolve");
};
