import * as express from "express";
import {
  handleInstallingApp,
  handleUpdatingBilling,
} from "../controllers/merchant";

export const appRoutes = (app: express.Router) => {
  app.post("/:domain/install/:shpat", handleInstallingApp);
  app.put("/:domain/billing", handleUpdatingBilling);
};
