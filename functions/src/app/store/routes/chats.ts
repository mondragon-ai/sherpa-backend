import * as express from "express";
import {
  handleDeleteChat,
  handleFetchAllChats,
  handleFetchNextChats,
  handleFilteredChats,
  handleRateChat,
  handleAddNote,
} from "../controllers/chats";

export const chatRoutes = (app: express.Router) => {
  app.get("/:domain/chats", handleFetchAllChats);
  app.get("/:domain/chats/:time", handleFetchNextChats);
  app.get("/:domain/chats/search", handleFilteredChats);
  app.delete("/:domain/chats/:id", handleDeleteChat);
  app.post("/:domain/chats/:id/note", handleAddNote);
  app.post("/:domain/chats/:id/rate", handleRateChat);
};
