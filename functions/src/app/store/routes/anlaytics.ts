import * as express from "express";
import {
  handleFetchAnalytics,
  handleSearchingAnalytics,
} from "../controllers/analytics";

export const analyticsRoutes = (app: express.Router) => {
  app.get("/:domain/analytics", handleFetchAnalytics);
  app.get("/:domain/analytics/search", handleSearchingAnalytics);
};
