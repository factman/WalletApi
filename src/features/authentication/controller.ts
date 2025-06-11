import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";

import database from "../../configs/database.js";
import { env } from "../../configs/env.js";
import { CustomError } from "../../helpers/errorInstance.js";
import { errorResponse, successResponse } from "../../helpers/responseHandlers.js";
import { UserStatus } from "../../models/UserModel.js";
import {
  ForgotPasswordResponse,
  InitiateAuthenticationResponse,
  InitiateBvnVerificationRequest,
  InitiateBvnVerificationResponse,
  LoginResponse,
  ResendEmailVerificationResponse,
  SignupResponse,
  VerifyBvnResponse,
  VerifyEmailResponse,
} from "./authenticationDTOs.js";
import { generateBvnVerificationToken, validateRefreshToken } from "./helpers/utilities.js";
import { AuthenticationService } from "./service.js";
import {
  forgotPasswordRequestSchema,
  initiateAuthenticationRequestSchema,
  initiateBvnVerificationRequestSchema,
  loginRequestSchema,
  refreshTokenRequestSchema,
  resendEmailVerificationRequestSchema,
  resetPasswordRequestSchema,
  signupRequestSchema,
  verifyBvnRequestSchema,
  verifyEmailRequestSchema,
  verifyForgotPasswordRequestSchema,
} from "./validationSchemas.js";

export class AuthenticationController {
  private service: AuthenticationService;

  constructor(service: AuthenticationService) {
    this.service = service;
  }

  async forgotPassword(req: Request, res: Response) {
    const body = forgotPasswordRequestSchema.parse(req.body);

    try {
      const foundUser = await this.service.findUserByEmail(body.email);

      const otpData = await database.transaction(async (trx) => {
        const ipAddress = req.ip ?? req.ips[0];
        const userAgent = req.headers["user-agent"] ?? "Unknown";
        const otp = await this.service.generateForgotPasswordOtp(trx, {
          deviceId: body.deviceId,
          email: foundUser.user.email,
          ipAddress,
          userAgent,
          userId: foundUser.user.id,
        });

        return otp;
      });

      successResponse<ForgotPasswordResponse>(res, otpData, "OTP sent successfully");
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async initiateAuth(req: Request, res: Response) {
    const body = initiateAuthenticationRequestSchema.parse(req.body);
    try {
      const verifiedData = await this.service.verifyUserLogin(body.email, body.password);

      const { otpData, user } = await database.transaction(async (trx) => {
        const ipAddress = req.ip ?? req.ips[0];
        const userAgent = req.headers["user-agent"] ?? "Unknown";
        const userSession = await this.service.createUserSession(trx, {
          deviceId: body.deviceId,
          ipAddress,
          userAgent,
          userId: verifiedData.user.id,
        });

        const otpData = await this.service.generateLoginOtp(trx, {
          deviceId: body.deviceId,
          email: verifiedData.user.email,
          ipAddress,
          sessionId: userSession.session.id,
          userAgent,
          userId: verifiedData.user.id,
        });

        return { otpData, user: verifiedData.user };
      });

      successResponse<InitiateAuthenticationResponse>(
        res,
        { email: user.email, ...otpData },
        "Authentication successful",
      );
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async initiateBvnVerification(req: Request, res: Response) {
    const body = initiateBvnVerificationRequestSchema.parse(req.body);
    const user = req.userPayload;
    const session = req.sessionPayload;

    try {
      const karma = await this.service.checkUserKarma(body.bvn);
      if (karma.isBlacklisted) {
        await database.transaction(async (trx) => {
          await this.service.blackListUser(trx, session.userId);
        });
        throw new CustomError("Verification failed", StatusCodes.BAD_REQUEST, {
          message: "BVN blacklisted",
        });
      }

      const bvnConsent = await this.service.sendBvnConsent(body.bvn, user.phone);
      const tokenData = generateBvnVerificationToken(
        {
          bvn: JSON.stringify(body),
          deviceId: session.deviceId,
          email: user.email,
          ipAddress: session.ipAddress,
          sessionId: session.id,
          userAgent: session.userAgent,
          userId: session.userId,
        },
        bvnConsent.message,
      );
      successResponse<InitiateBvnVerificationResponse>(
        res,
        { ...tokenData },
        "Bvn concent initiated successfully",
      );
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async login(req: Request, res: Response) {
    const message = "Login failed";
    const body = loginRequestSchema.parse(req.body);
    const tokenPayload = req.verificationTokenPayload;

    try {
      const validSession = await this.service.getValidatedUserSession({
        deviceId: tokenPayload.deviceId,
        id: tokenPayload.sessionId,
        userId: tokenPayload.userId,
      });

      if (body.otp !== validSession.session.twoFactorCode)
        throw new CustomError(message, StatusCodes.BAD_REQUEST, {
          message: "Invalid OTP, try again",
        });

      await database.transaction(async (trx) => {
        await this.service.completeLogin(trx, validSession.session.id, validSession.session.userId);
      });

      const authenticatedUser = await this.service.getAuthUserData(validSession.session.id);
      successResponse<LoginResponse>(
        res,
        {
          accessToken: validSession.session.accessToken,
          accessTokenExpiresAt: DateTime.fromSQL(
            validSession.session.accessTokenExpiresAt,
          ).toMillis(),
          refreshToken: validSession.session.refreshToken,
          refreshTokenExpiresAt: DateTime.fromSQL(
            validSession.session.refreshTokenExpiresAt,
          ).toMillis(),
          userData: authenticatedUser.userData,
        },
        "Login successfully",
      );
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async logout(req: Request, res: Response) {
    const session = req.sessionPayload;

    try {
      await database.transaction(async (trx) => {
        await this.service.deleteUserSession(trx, session.id);
      });
      successResponse(res, null, "Logout successfully");
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async refreshToken(req: Request, res: Response) {
    const body = refreshTokenRequestSchema.parse(req.body);
    const message = "Error refreshing token";
    try {
      const token = validateRefreshToken(body.refreshToken);
      if (token.error || !token.tokenPayload)
        throw new CustomError(message, StatusCodes.BAD_REQUEST, {
          message: token.error,
        });

      const { session } = await database.transaction(async (trx) => {
        const ipAddress = req.ip ?? req.ips[0];
        const userAgent = req.headers["user-agent"] ?? "Unknown";
        const userSession = await this.service.refreshSessionTokens(
          trx,
          token.tokenPayload.sessionId,
          {
            deviceId: body.deviceId,
            ipAddress,
            userAgent,
            userId: token.tokenPayload.userId,
          },
        );

        return { session: userSession.session };
      });

      const authenticatedUser = await this.service.getAuthUserData(session.id);
      successResponse<LoginResponse>(
        res,
        {
          accessToken: session.accessToken,
          accessTokenExpiresAt: DateTime.fromSQL(session.accessTokenExpiresAt).toMillis(),
          refreshToken: session.refreshToken,
          refreshTokenExpiresAt: DateTime.fromSQL(session.refreshTokenExpiresAt).toMillis(),
          userData: authenticatedUser.userData,
        },
        "Token refreshed successfully",
      );
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
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

  async resetPassword(req: Request, res: Response) {
    const body = resetPasswordRequestSchema.parse(req.body);
    const session = req.sessionPayload;
    const tokenPayload = req.verificationTokenPayload;

    try {
      const { user } = await this.service.verifyUserLogin(tokenPayload.email, body.oldPassword);
      if (body.deviceId !== session.deviceId || !user.isPasswordResetRequired)
        throw new CustomError("Invalid credentials", StatusCodes.BAD_REQUEST, {
          message: "Invalid credentials. check and try again",
        });

      await database.transaction(async (trx) => {
        await this.service.resetUserPassword(trx, user.id, body.newPassword);
      });

      successResponse(res, null, "Password reset successfully, login again");
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async signup(req: Request, res: Response) {
    const body = signupRequestSchema.parse(req.body);

    try {
      await this.service.checkIfUserExists(body.email, body.phone);

      const { session, user, verificationData } = await database.transaction(async (trx) => {
        const createdUser = await this.service.createUser(trx, {
          email: body.email,
          password: body.password,
          phone: body.phone,
          timezone: body.timezone,
        });

        const userSession = await this.service.createUserSession(trx, {
          deviceId: body.deviceId,
          ipAddress: req.ip ?? req.ips[0],
          userAgent: req.headers["user-agent"] ?? "Unknown",
          userId: createdUser.user.id,
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
      console.log(err);
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async verifyBvn(req: Request, res: Response) {
    const body = verifyBvnRequestSchema.parse(req.body);
    const session = req.sessionPayload;
    const user = req.userPayload;
    const tokenPayload = req.verificationTokenPayload;

    try {
      if (user.isKycVerified) {
        const authenticatedUser = await this.service.getAuthUserData(session.id);
        successResponse<VerifyBvnResponse>(
          res,
          { userData: authenticatedUser.userData },
          "Bvn already verified.",
        );
      } else {
        const bvnData = await this.service.getBvnData(tokenPayload.bvn ?? "", body.otp);

        await database.transaction(async (trx) => {
          const kycData: InitiateBvnVerificationRequest = JSON.parse(tokenPayload.bvn ?? "{}");
          const kyc = await this.service.completeUserKyc(trx, user.id, kycData, bvnData.profile);

          const accountNames =
            env.NODE_ENV === "development"
              ? [kyc.profile.firstName, kyc.profile.lastName]
              : [
                  bvnData.profile.first_name,
                  bvnData.profile.middle_name,
                  bvnData.profile.last_name,
                ];

          await this.service.createWallet(trx, {
            accountName: accountNames.join(""),
            accountNumber: user.phone.slice(-10),
            userId: user.id,
          });
        });

        const authenticatedUser = await this.service.getAuthUserData(session.id);
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

  async verifyEmail(req: Request, res: Response) {
    const body = verifyEmailRequestSchema.parse(req.body);
    const message = "Unable to verify email";
    const session = req.sessionPayload;
    const user = req.userPayload;
    const tokenPayload = req.verificationTokenPayload;

    try {
      if (user.isEmailVerified && user.isTwoFactorEnabled) {
        const authenticatedUser = await this.service.getAuthUserData(session.id);
        successResponse<VerifyEmailResponse>(
          res,
          { userData: authenticatedUser.userData },
          "Account already verified.",
        );
      } else {
        if (body.otp !== session.twoFactorCode || tokenPayload.sessionId !== session.id)
          throw new CustomError(message, StatusCodes.BAD_REQUEST, {
            message: "Invalid OTP, try again",
          });

        const verifiedData = await database.transaction(async (trx) => {
          const verifiedUserData = await this.service.verifyUserEmail(
            trx,
            session.id,
            session.userId,
          );

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

  async verifyForgotPassword(req: Request, res: Response) {
    const body = verifyForgotPasswordRequestSchema.parse(req.body);
    const session = req.sessionPayload;

    try {
      if (body.otp !== session.twoFactorCode)
        throw new CustomError("Invalid OTP, try again", StatusCodes.BAD_REQUEST, {
          message: "Unable to verify OTP, try again",
        });

      await database.transaction(async (trx) => {
        await this.service.enablePasswordReset(trx, session.userId);
      });

      successResponse(res, null, "Verification successful, reset password now");
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }
}
