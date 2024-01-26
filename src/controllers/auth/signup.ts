import { authService } from "@gateway/services/api/auth.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export class SignUp {
  public async create(req: Request, res: Response): Promise<void> {
    const response = await authService.signup(req.body);
    req.session = { jwt: response.data.token };
    res.status(StatusCodes.CREATED).json({});
  }
}
