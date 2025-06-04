import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";

import database from "@/configs/database";
import { CustomError } from "@/helpers/errorInstance";
import { errorResponse, successResponse } from "@/helpers/responseHandlers";

import { SignupResponse } from "./authenticationDTOs";
import { AuthenticationService } from "./service";
import { signupRequestSchema } from "./validationSchemas";

export class AuthenticationController {
  private service: AuthenticationService;

  constructor(service: AuthenticationService) {
    this.service = service;
  }

  route(req: Request, res: Response) {
    successResponse(res, { url: req.url }, "Message");
  }

  async signup(req: Request, res: Response) {
    const body = signupRequestSchema.parse(req.body);
    const findUser = await this.service.checkIfUserExists(body.email, body.phone);
    if (findUser.found)
      return errorResponse(
        res,
        StatusCodes.CONFLICT,
        { message: findUser.message },
        "User already exists",
      );

    try {
      const { session, user, verificationData } = await database.transaction(async (trx) => {
        const createdUser = await this.service.createUser(trx, {
          email: body.email,
          password: body.password,
          phone: body.phone,
          timezone: body.timezone,
        });
        if (createdUser.error || !createdUser.user)
          throw new CustomError(createdUser.error, StatusCodes.INTERNAL_SERVER_ERROR);

        const userSession = await this.service.createUserSession(trx, {
          deviceId: body.deviceId,
          ipAddress: req.ip ?? req.ips[0],
          userAgent: req.headers["user-agent"] ?? "Unknown",
          userId: createdUser.user.id,
        });
        if (userSession.error || !userSession.session)
          throw new CustomError(userSession.error, StatusCodes.INTERNAL_SERVER_ERROR);

        const verificationData = await this.service.initiateEmailVerification(trx, {
          deviceId: userSession.session.deviceId,
          email: body.email,
          ipAddress: userSession.session.ipAddress,
          sessionId: userSession.session.id,
          userAgent: userSession.session.userAgent,
          userId: userSession.session.userId,
        });

        return { session: userSession.session, user: createdUser.user, verificationData };
      });

      await this.service.sendUserWelcomeEmail(user.email);

      const authenticatedUser = await this.service.getAuthUserData(session.id);
      if (authenticatedUser.error || !authenticatedUser.userData)
        throw new CustomError(authenticatedUser.error, StatusCodes.UNAUTHORIZED);

      successResponse<SignupResponse>(
        res,
        {
          accessToken: session.accessToken,
          accessTokenExpiresAt: DateTime.fromSQL(session.accessTokenExpiresAt).toMillis(),
          otpExpiresAt: verificationData.otpExpiresAt,
          otpMessage: verificationData.otpMessage,
          userData: authenticatedUser.userData,
          verificationToken: verificationData.verificationToken,
        },
        "Account created successfully",
      );
    } catch (error) {
      if (error instanceof CustomError) {
        return errorResponse(res, error.status, { message: error.message });
      }
      errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }
}
