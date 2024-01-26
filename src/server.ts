import { CustomError, IErrorResponse, winstonLogger } from "@CauaHenrique19/jobber-shared";
import { Application, NextFunction, Request, Response, json, urlencoded } from "express";
import cookieSession from "cookie-session";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { StatusCodes } from "http-status-codes";
import http from "http";

import { config } from "@gateway/config";
import { elasticSearch } from "@gateway/elasticsearch";
import { appRoutes } from "@gateway/routes";
import { axiosAuthInstance } from "@gateway/services/api/auth.service";

const SERVER_PORT = 4000;
const log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, "apiGatewayServer", "debug");

export class GatewayServer {
  constructor(private readonly app: Application) {}

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.startElasticSearch();
    this.errorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.set("trust proxy", 1);
    app.use(
      cookieSession({
        name: "session",
        keys: [`${config.SECRET_KEY_ONE}`, `${config.SECRET_KEY_TWO}`],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== "development",
        //sameSite: "none"
      }),
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      }),
    );

    app.use((req: Request, _response: Response, next: NextFunction) => {
      if (req.session?.jwt) {
        axiosAuthInstance.defaults.headers["Authorization"] = `Bearer ${req.session?.jwt}`;
      }

      next();
    });
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: "200mb" }));
    app.use(urlencoded({ extended: true, limit: "200mb" }));
  }

  private routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  private startElasticSearch(): void {
    elasticSearch.checkConnection();
  }

  private errorHandler(app: Application): void {
    app.use("*", (req, res, next) => {
      const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      log.log("error", `${fullUrl} endpoint does not exist.`, "");
      res.status(StatusCodes.NOT_FOUND).json({ message: "The endpoint called does not exist." });
      next();
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.error("error", `GatewayService ${error.comingFrom}`, error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer = new http.Server(app);
      this.startHttpServer(httpServer);
    } catch (error) {
      log.error("error", `GatewayService startServer() error method:`, error);
    }
  }

  private startHttpServer(httpServer: http.Server): void {
    try {
      log.info(`Gateway server has started with process id ${process.pid}`);
      httpServer.listen(SERVER_PORT, () => {
        log.info(`Gateway server running on port ${SERVER_PORT}`);
      });
    } catch (error) {
      log.error("error", `GatewayService startServer() error method:`, error);
    }
  }
}
