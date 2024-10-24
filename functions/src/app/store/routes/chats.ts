import * as express from "express";

export const chatRoutes = (app: express.Router) => {
  app.get("/:domain/chats");
  app.delete("/:domain/chats/:id");
};
