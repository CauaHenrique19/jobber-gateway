import express, { Router } from "express";
import { CurrentUser } from "@gateway/controllers/auth/current-user";
import { authMiddleware } from "@gateway/services/auth-middleware";
import { Refresh } from "@gateway/controllers/auth/refresh-token";

class CurrentUserRoutes {
  private router = express.Router();

  public routes(): Router {
    this.router.get("/auth/currentuser", authMiddleware.checkAuthentication, CurrentUser.prototype.read);
    this.router.post("/auth/resend-email", authMiddleware.checkAuthentication, CurrentUser.prototype.resendEmail);
    this.router.post("/auth/refresh-token/:username", authMiddleware.checkAuthentication, Refresh.prototype.token);

    return this.router;
  }
}

export const currentUserRoutes = new CurrentUserRoutes();
