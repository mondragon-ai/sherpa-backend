import * as express from "express";
import {
  handleCreateDiscounts,
  handleDeleteDiscount,
} from "../controllers/discounts";

export const discountRoutes = (app: express.Router) => {
  app.post("/:domain/discounts", handleCreateDiscounts);
  app.delete("/:domain/discounts/:token", handleDeleteDiscount);
};
