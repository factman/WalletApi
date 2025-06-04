import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Knex from "knex";
import { DateTime } from "luxon";
import { randomUUID } from "node:crypto";

import { env } from "@/configs/env";
import { TokenAuthType, TokenType } from "@/helpers/types";
import AuthenticatedUserModel from "@/models/AuthenticatedUserModel";
import SessionModel from "@/models/SessionModel";
import UserModel from "@/models/UserModel";
import { AuthenticatedUserRepository } from "@/repositories/AuthenticatedUserRepository";
import { SessionRepository } from "@/repositories/SessionRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { ResendService } from "@/services/ResendService";

export class AuthenticationService {
  private authUserRepository: AuthenticatedUserRepository;
  private resendService: ResendService;
  private sessionRepository: SessionRepository;
  private userRepository: UserRepository;

  constructor(
    userRepository = new UserRepository(),
    sessionRepository = new SessionRepository(),
    resendService = new ResendService(),
    authUserRepository = new AuthenticatedUserRepository(),
  ) {
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
    this.resendService = resendService;
    this.authUserRepository = authUserRepository;
  }

  async checkIfUserExists(email: string, phone: string) {
    const data = await this.userRepository.checkIfUserExist(email, phone);
    const found = {
      email: data.some((user) => user.email === email),
      phone: data.some((user) => user.phone === phone),
    };

    if (found.email && found.phone)
      return { found: true, message: "User with this email and phone number already exists." };

    if (found.email) return { found: true, message: "User with this email already exists." };

    if (found.phone) return { found: true, message: "User with this phone number already exists." };

    return { found: false, message: "User does not exist." };
  }

  async createUser(
    trx: Knex.Knex.Transaction,
    userData: Pick<UserModel, "email" | "password" | "phone" | "timezone">,
  ) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const user = await this.userRepository.createUser(trx, {
      ...userData,
      password: hashedPassword,
    });

    if (!user) {
      return { error: "Failed to create user. Please try again." };
    }
    return { user };
  }

  async createUserSession(
    trx: Knex.Knex.Transaction,
    sessionData: Pick<SessionModel, "deviceId" | "ipAddress" | "userAgent" | "userId">,
  ) {
    await this.deleteUserSession(trx, sessionData.userId);

    const accessTokenTime = DateTime.utc().plus({ seconds: env.ACCESS_TOKEN_EXPIRATION });
    const refreshTokenTime = DateTime.utc().plus({ seconds: env.REFRESH_TOKEN_EXPIRATION });
    const tokenPayload: TokenPayload = {
      deviceId: sessionData.deviceId,
      exp: accessTokenTime.toUnixInteger(),
      ipAddress: sessionData.ipAddress,
      sessionId: randomUUID(),
      type: TokenType.ACCESS,
      userAgent: sessionData.userAgent,
      userId: sessionData.userId,
    };

    const accessToken = jwt.sign(tokenPayload, env.ACCESS_TOKEN_SECRET);
    const refreshToken = jwt.sign(
      { ...tokenPayload, exp: refreshTokenTime.toUnixInteger(), type: TokenType.REFRESH },
      env.REFRESH_TOKEN_SECRET,
    );

    const session = await this.sessionRepository.createSession(trx, {
      ...sessionData,
      accessToken,
      accessTokenExpiresAt: accessTokenTime.toSQL({ includeOffset: false }),
      expiresAt: refreshTokenTime.toSQL({ includeOffset: false }),
      id: tokenPayload.sessionId,
      refreshToken,
      refreshTokenExpiresAt: refreshTokenTime.toSQL({ includeOffset: false }),
    });

    if (!session) {
      return { error: "Failed to create user session. Please try again." };
    }

    return { session };
  }

  async deleteUserSession(trx: Knex.Knex.Transaction, userId: SessionModel["userId"]) {
    return await this.sessionRepository.deleteSession(trx, userId);
  }

  async getAuthUserData(sessionId: AuthenticatedUserModel["userId"]) {
    const userData = await this.authUserRepository.getUserBySessionId(sessionId);
    if (!userData) return { error: "User session not found" };
    return { userData };
  }

  async initiateEmailVerification(
    trx: Knex.Knex.Transaction,
    sessionData: Omit<VerificationTokenPayload, "authType" | "bvn" | "exp" | "type">,
  ) {
    const otp = this.generateOTP();
    const tokenTime = DateTime.utc().plus({ seconds: env.VERIFICATION_TOKEN_EXPIRATION });
    const tokenPayload: VerificationTokenPayload = {
      ...sessionData,
      authType: TokenAuthType.EMAIL,
      exp: tokenTime.toUnixInteger(),
      type: TokenType.VERIFICATION,
    };
    const verificationToken = jwt.sign(tokenPayload, env.VERIFICATION_TOKEN_SECRET);
    await this.sessionRepository.updateSession(trx, sessionData.sessionId, {
      isTwoFactorVerified: false,
      twoFactorCode: otp,
      twoFactorCodeExpiresAt: tokenTime.toSQL({ includeOffset: false }),
      twoFactorVerifiedAt: null,
    });
    await this.resendService.sendEmailVerificationOTP(
      tokenPayload.email,
      this.getUsername(sessionData.email),
      otp,
      tokenTime,
    );

    return {
      otpExpiresAt: tokenTime.toMillis(),
      otpMessage:
        "A One-Time Password (OTP) has been sent to your email address. Please check your inbox and verify your email using the OTP.",
      verificationToken,
    };
  }

  async sendUserWelcomeEmail(email: string) {
    await this.resendService.sendWelcomeEmail(email, this.getUsername(email));
  }

  private generateOTP(length = 6) {
    return Math.random().toString().slice(-length);
  }

  private getUsername(email: string) {
    return `@${email.split("@")[0]}`;
  }
}
