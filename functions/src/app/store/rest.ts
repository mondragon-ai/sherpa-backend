import * as express from "express";
import * as bearer from "express-bearer-token";
import * as bodyParser from "body-parser";
import * as cors from "cors";

// Routes
import {configurationRoutes} from "./routes/configuration";
import {discountRoutes} from "./routes/discounts";
import {merchantRoutes} from "./routes/merchant";
import {emailtRoutes} from "./routes/email";
import {chatRoutes} from "./routes/chats";
import {analyticsRoutes} from "./routes/anlaytics";

export const rest = () => {
  const app = express();

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(express.json());
  app.use(bearer());
  app.use(cors({origin: true}));

  // CRUD Routes Here
  configurationRoutes(app);
  analyticsRoutes(app);
  merchantRoutes(app);
  discountRoutes(app);
  emailtRoutes(app);
  chatRoutes(app);

  return app;
};
