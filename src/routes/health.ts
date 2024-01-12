import { Health } from "@gateway/controllers/health";
import express, { Router } from "express";

class HealthRoutes {
  private router = express.Router();

  public routes(): Router {
    this.router.get("/gateway-health", Health.prototype.health);
    return this.router;
  }
}

export const healthRoutes = new HealthRoutes();
