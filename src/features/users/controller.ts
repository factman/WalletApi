import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import database from "../../configs/database.js";
import { CustomError } from "../../helpers/errorInstance.js";
import { errorResponse, successResponse } from "../../helpers/responseHandlers.js";
import { idParamSchema } from "../../validations/validationSchemas.js";
import { UsersService } from "./service.js";
import { GetUserResponse } from "./usersDTO.js";
import { changePasswordRequestSchema } from "./validationSchemas.js";

export class UsersController {
  private service: UsersService;

  constructor(service: UsersService) {
    this.service = service;
  }

  async changePassword(req: Request, res: Response) {
    const body = changePasswordRequestSchema.parse(req.body);
    const user = req.userPayload;
    const params = idParamSchema.parse(req.params);

    try {
      await this.service.verifyOldPassword(user, body.oldPassword);
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
    const params = idParamSchema.parse(req.params);

    try {
      await database.transaction(async (trx) => {
        await this.service.deleteUserAccount(trx, params.id);
      });

      successResponse(res, null, "Account deleted successfully");
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async getUser(req: Request, res: Response) {
    const params = idParamSchema.parse(req.params);

    try {
      const { profile } = await this.service.getUserProfile(params.id);

      successResponse<GetUserResponse>(res, profile, "Fetched user profile successfully");
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }
}
