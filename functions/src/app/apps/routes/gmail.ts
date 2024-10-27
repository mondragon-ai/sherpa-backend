import * as express from "express";
import {
  handleAuthGmail,
  handleCallback,
  handleSendEmail,
  handleReceiveEmails,
  handleSubscription,
} from "../controller/gmail";

export const gmailRoutes = (app: express.Router) => {
  app.get("/gmail/:domain/auth", handleAuthGmail);
  app.get("/gmail/auth/callback", handleCallback);
  app.post("/gmail/:domain/email/send", handleSendEmail);
  app.get("/gmail/:domain/email/receive", handleReceiveEmails);
  app.post("/gmail/:domain/subscribe", handleSubscription);
};
