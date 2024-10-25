import * as express from "express";
import * as bearer from "express-bearer-token";
import * as bodyParser from "body-parser";
import * as cors from "cors";

// Routes

export const rest = () => {
  const app = express();

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(express.json());
  app.use(bearer());
  app.use(cors({origin: true}));

  // CRUD Routes Here

  return app;
};
