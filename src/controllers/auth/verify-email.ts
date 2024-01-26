import { authService } from "@gateway/services/api/auth.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export class VerifyEmail {
  public async update(req: Request, res: Response): Promise<void> {
    const response = await authService.verifyEmail(req.body.token);
    res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });
  }
}
