import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import database from "../../configs/database.js";
import { CustomError } from "../../helpers/errorInstance.js";
import { errorResponse, successResponse } from "../../helpers/responseHandlers.js";
import { UsersService } from "./service.js";
import { GetUserResponse } from "./usersDTO.js";
import { changePasswordRequestSchema, userIdParamSchema } from "./validationSchemas.js";

export class UsersController {
  private service: UsersService;

  constructor(service: UsersService) {
    this.service = service;
  }

  async changePassword(req: Request, res: Response) {
    const body = changePasswordRequestSchema.parse(req.body);
    const user = req.userPayload;
    const params = userIdParamSchema.parse(req.params);

    try {
      const password = await this.service.verifyOldPassword(user, body.oldPassword);
      if (password.error || !password.valid)
        throw new CustomError("Invalid credentials", StatusCodes.BAD_REQUEST, {
          message: password.error,
        });

      await database.transaction(async (trx) => {
        await this.service.changeUserPassword(trx, params.id, body.newPassword);
      });

      successResponse(res, null, "Password changed successfully");
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async deleteAccount(req: Request, res: Response) {
    const params = userIdParamSchema.parse(req.params);

    try {
      await database.transaction(async (trx) => {
        const { error } = await this.service.deleteUserAccount(trx, params.id);
        if (error)
          throw new CustomError("Invalid user", StatusCodes.BAD_REQUEST, { message: error });
      });

      successResponse(res, null, "Account deleted successfully");
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async getUser(req: Request, res: Response) {
    const params = userIdParamSchema.parse(req.params);

    try {
      const { error, profile } = await this.service.getUserProfile(params.id);
      if (error || !profile)
        throw new CustomError("Not Found", StatusCodes.NOT_FOUND, { message: error });

      successResponse<GetUserResponse>(res, profile, "Fetched user profile successfully");
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  route(req: Request, res: Response) {
    successResponse(res, { url: req.url }, "Message");
  }
}
