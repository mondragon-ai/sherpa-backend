import * as express from "express";
import {
  handleFetchConfigs,
  handleUpdateConfigs,
} from "../controllers/configuration";

export const configurationRoutes = (app: express.Router) => {
  app.get("/:domain/configs", handleFetchConfigs);
  app.post("/:domain/configs", handleUpdateConfigs);
};
