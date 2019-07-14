import errorHandler from "errorhandler";
import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import path from "path";

// Controllers (route handlers)
import * as apiController from "./controllers/api";
import * as http from "http";

export class ExpressServer {
  app = express();
  httpServer: http.Server;

  constructor() {
    this.app.set("port", process.env.PORT || 3000);
    this.app.set("view engine", "pug");
    this.app.use(compression());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: true}));

    this.app.use(express.static(path.join(__dirname, "public"), {maxAge: 31557600000}));

    /**
     * Error Handler. Provides full stack - remove for production
     */
    this.app.use(errorHandler());
    this.app.get("/api", apiController.getApi);

    this.httpServer = this.app.listen(this.app.get("port"), () => {
      console.log(
        "  HTTP server is running at http://localhost:%d in %s mode",
        this.app.get("port"),
        this.app.get("env")
      );
      console.log("  Press CTRL-C to stop\n");
    });
  }
}
