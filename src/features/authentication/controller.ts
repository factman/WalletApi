import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";

import database from "@/configs/database";
import { CustomError } from "@/helpers/errorInstance";
import { errorResponse, successResponse } from "@/helpers/responseHandlers";
import { TokenAuthType } from "@/helpers/types";
import { UserStatus } from "@/models/UserModel";

import {
  ResendEmailVerificationResponse,
  SignupResponse,
  VerifyEmailResponse,
} from "./authenticationDTOs";
import { AuthenticationService } from "./service";
import {
  resendEmailVerificationRequestSchema,
  signupRequestSchema,
  verifyEmailRequestSchema,
} from "./validationSchemas";

export class AuthenticationController {
  private service: AuthenticationService;

  constructor(service: AuthenticationService) {
    this.service = service;
  }

  async resendEmailVerification(req: Request, res: Response) {
    const body = resendEmailVerificationRequestSchema.parse(req.body);
    const session = req.sessionPayload;
    const user = req.userPayload;

    try {
      if (user.isEmailVerified && user.status === UserStatus.VERIFIED)
        throw new CustomError("Error sending verification", StatusCodes.BAD_REQUEST, {
          message: "Account already verified.",
        });

      if (body.email !== user.email)
        throw new CustomError("Error sending verification", StatusCodes.BAD_REQUEST, {
          message: "Invalid email address. check and try again",
        });

      const otpData = await database.transaction(async (trx) => {
        const verificationData = await this.service.initiateEmailVerification(trx, {
          deviceId: session.deviceId,
          email: user.email,
          ipAddress: session.ipAddress,
          sessionId: session.id,
          userAgent: session.userAgent,
          userId: session.userId,
        });

        return verificationData;
      });

      successResponse<ResendEmailVerificationResponse>(
        res,
        {
          ...otpData,
          email: user.email,
        },
        "Verification sent successfully",
      );
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  route(req: Request, res: Response) {
    successResponse(res, { url: req.url }, "Message");
  }

  async signup(req: Request, res: Response) {
    const body = signupRequestSchema.parse(req.body);

    try {
      const findUser = await this.service.checkIfUserExists(body.email, body.phone);
      if (findUser.found)
        throw new CustomError("User already exist", StatusCodes.CONFLICT, {
          message: findUser.message,
        });

      const { session, user, verificationData } = await database.transaction(async (trx) => {
        const createdUser = await this.service.createUser(trx, {
          email: body.email,
          password: body.password,
          phone: body.phone,
          timezone: body.timezone,
        });
        if (createdUser.error || !createdUser.user)
          throw new CustomError("Server error, try again", StatusCodes.INTERNAL_SERVER_ERROR, {
            message: createdUser.error,
          });

        const userSession = await this.service.createUserSession(trx, {
          deviceId: body.deviceId,
          ipAddress: req.ip ?? req.ips[0],
          userAgent: req.headers["user-agent"] ?? "Unknown",
          userId: createdUser.user.id,
        });
        if (userSession.error || !userSession.session)
          throw new CustomError("Server error, try again", StatusCodes.INTERNAL_SERVER_ERROR, {
            message: userSession.error,
          });

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
        StatusCodes.CREATED,
      );
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async verifyEmail(req: Request, res: Response) {
    const body = verifyEmailRequestSchema.parse(req.body);
    const message = "Unable to verify email";
    const session = req.sessionPayload;
    const user = req.userPayload;

    try {
      if (user.isEmailVerified && user.status === UserStatus.VERIFIED) {
        const authenticatedUser = await this.service.getAuthUserData(session.id);
        successResponse<VerifyEmailResponse>(
          res,
          { userData: authenticatedUser.userData },
          "Account already verified.",
        );
      } else {
        const validToken = this.service.validateVerificationToken(
          body.verificationToken,
          TokenAuthType.EMAIL,
        );
        if (validToken.error || !validToken.tokenPayload)
          throw new CustomError(message, StatusCodes.BAD_REQUEST, {
            message: validToken.error,
          });

        if (body.otp !== session.twoFactorCode || validToken.tokenPayload.sessionId !== session.id)
          throw new CustomError(message, StatusCodes.BAD_REQUEST, {
            message: "Invalid OTP, try again",
          });

        const verifiedData = await database.transaction(async (trx) => {
          const verifiedUserData = await this.service.verifyUserEmail(
            trx,
            session.id,
            session.userId,
          );

          if (!verifiedUserData.user || !verifiedUserData.session)
            throw new CustomError(message, StatusCodes.INTERNAL_SERVER_ERROR, {
              message: "Unable to verify email address, try again",
            });

          return { session: verifiedUserData.session, user: verifiedUserData.user };
        });

        const authenticatedUser = await this.service.getAuthUserData(verifiedData.session.id);
        successResponse<VerifyEmailResponse>(
          res,
          { userData: authenticatedUser.userData },
          "Account verified successfully",
        );
      }
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }
}
