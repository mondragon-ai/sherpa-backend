import * as cors from "cors";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as bearer from "express-bearer-token";

// Routes
import {gmailRoutes} from "./routes/gmail";
import {rechargeRoutes} from "./routes/recharge";

export const rest = () => {
  const app = express();

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(express.json());
  app.use(bearer());
  app.use(cors({origin: true}));

  // CRUD Routes Here
  rechargeRoutes(app);
  gmailRoutes(app);

  return app;
};
