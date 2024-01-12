import { BadRequestError, IAuthPayload, NotAuthorizedError } from "@CauaHenrique19/jobber-shared";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { config } from "@gateway/config";

class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError("Token is not available. Please login again", "GatewayService verifyUser()");
    }

    try {
      const payload = verify(req.session?.jwt, `${config.JWT_TOKEN}`) as IAuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError(
        "Token is not available. Please login again",
        "GatewayService verifyUser() method invalid session error",
      );
    }

    next();
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new BadRequestError(
        "Authentication is required to access this route.",
        "GatewayService checkAuthentication() method invalid session error",
      );
    }

    next();
  }
}

export const authMiddleware = new AuthMiddleware();
