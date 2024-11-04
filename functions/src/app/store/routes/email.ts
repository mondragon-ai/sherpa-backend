import * as express from "express";
import {
  handleDeleteEmail,
  handleFetchAllEmails,
  handleFetchNextEmails,
  handleFilteredEmails,
  handleAddNote,
  handleRateEmail,
  handleFetchEmail,
} from "../controllers/emails";

export const emailtRoutes = (app: express.Router) => {
  app.get("/:domain/email/:id", handleFetchEmail);
  app.get("/:domain/emails", handleFetchAllEmails);
  app.get("/:domain/emails/time", handleFetchNextEmails);
  app.get("/:domain/emails/search", handleFilteredEmails);
  app.delete("/:domain/emails/:id", handleDeleteEmail);
  app.post("/:domain/emails/:id/note", handleAddNote);
  app.post("/:domain/emails/:id/rate", handleRateEmail);
};
