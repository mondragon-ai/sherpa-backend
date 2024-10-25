import * as express from "express";
import {handleCustomerSearch} from "../controller/agents";

export const agentsRoutes = (app: express.Router) => {
  app.post("/:domain/agents/customer/:email", handleCustomerSearch);
  app.post("/:domain/agents/products/:query");
  app.post("/:domain/agents/initiate");
  app.post("/:domain/agents/respond");
  app.post("/:domain/agents/resolve");
};
