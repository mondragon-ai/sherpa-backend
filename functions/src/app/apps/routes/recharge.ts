import * as express from "express";
import {handleSaveRecharge, handleRemoveRecharge} from "../controller/recharge";

export const rechargeRoutes = (app: express.Router) => {
  app.post("/recharge/:domain/save/:at", handleSaveRecharge);
  app.delete("/recharge/:domain/remove:at", handleRemoveRecharge);
};
