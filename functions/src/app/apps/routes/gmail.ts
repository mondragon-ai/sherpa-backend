import * as express from "express";
import {
  handleAuthGmail,
  handleCallback,
  handleSendEmail,
  handleReceiveEmails,
  handleSubscription,
} from "../controller/gmail";

export const gmailRoutes = (app: express.Router) => {
  app.get("/:domain/auth", handleAuthGmail);
  app.get("/auth/callback", handleCallback);
  app.post("/:domain/email/send", handleSendEmail);
  app.get("/:domain/email/receive", handleReceiveEmails);
  app.post("/:domain/subscribe", handleSubscription);
};
