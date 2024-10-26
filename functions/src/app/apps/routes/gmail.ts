import * as express from "express";
import {
  handleAuthGmail,
  handleCallback,
  handleSendEmail,
  handleReceiveEmails,
} from "../controller/gmail";

export const gmailRoutes = (app: express.Router) => {
  app.get("/:domain/auth", handleAuthGmail);
  app.get("/auth/callback", handleCallback);
  app.get("/:domain/email/send", handleSendEmail);
  app.get("/:domain/email/receive", handleReceiveEmails);
};
