import express from "express";
import { GatewayServer } from "@gateway/server";

class Application {
  public initialize(): void {
    const app = express();
    const server = new GatewayServer(app);
    server.start();
  }
}

const application = new Application();
application.initialize();
