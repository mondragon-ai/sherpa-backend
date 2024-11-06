import * as express from "express";
import {
  handleFetchConfigs,
  handleUpdateConfigs,
  handleFetchIntegrations,
} from "../controllers/configuration";

export const configurationRoutes = (app: express.Router) => {
  app.get("/:domain/configs", handleFetchConfigs);
  app.get("/:domain/integrations", handleFetchIntegrations);
  app.post("/:domain/configs", handleUpdateConfigs);
};
