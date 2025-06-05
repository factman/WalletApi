import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import Knex from "knex";
import { DateTime } from "luxon";
import { randomUUID } from "node:crypto";

import database from "@/configs/database";
import { env } from "@/configs/env";
import { CustomError } from "@/helpers/errorInstance";
import { TokenAuthType, TokenPayload, TokenType, VerificationTokenPayload } from "@/helpers/types";
import AuthenticatedUserModel from "@/models/AuthenticatedUserModel";
import ProfileModel from "@/models/ProfileModel";
import SessionModel from "@/models/SessionModel";
import UserModel, { UserStatus } from "@/models/UserModel";
import WalletModel from "@/models/WalletModel";
import { AuthenticatedUserRepository } from "@/repositories/AuthenticatedUserRepository";
import { ProfileRepository } from "@/repositories/ProfileRepository";
import { SessionRepository } from "@/repositories/SessionRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { WalletRepository } from "@/repositories/WalletRepository";
import { AdjutorBvnPayload, AdjutorService } from "@/services/AdjutorService";
import { ResendService } from "@/services/ResendService";

import { InitiateBvnVerificationRequest } from "./authenticationDTOs";
import { generateOTP, getUsername, hashPassword } from "./helpers/utilities";

export class AuthenticationService {
  private adjutorService: AdjutorService;
  private authUserRepository: AuthenticatedUserRepository;
  private profileRepository: ProfileRepository;
  private resendService: ResendService;
  private sessionRepository: SessionRepository;
  private userRepository: UserRepository;
  private walletRepository: WalletRepository;

  constructor(
    userRepository = new UserRepository(),
    sessionRepository = new SessionRepository(),
    resendService = new ResendService(),
    authUserRepository = new AuthenticatedUserRepository(),
    adjutorService = new AdjutorService(),
    profileRepository = new ProfileRepository(),
    walletRepository = new WalletRepository(),
  ) {
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
    this.resendService = resendService;
    this.authUserRepository = authUserRepository;
    this.adjutorService = adjutorService;
    this.profileRepository = profileRepository;
    this.walletRepository = walletRepository;
  }

  async blackListUser(trx: Knex.Knex.Transaction, userId: UserModel["id"]) {
    await this.deleteUserSession(trx, userId);
    await this.userRepository.blacklistUserById(trx, userId);
  }

  async checkIfUserExists(email: UserModel["email"], phone: UserModel["phone"]) {
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

  async checkUserKarma(bvn: ProfileModel["bvn"]) {
    const userKarma = await this.adjutorService.karmaLookup(bvn);
    if (userKarma.status !== "success")
      throw new CustomError(userKarma.message, StatusCodes.BAD_REQUEST);

    // I can't really tell what the response is supposed to be for users who are not blacklisted
    // but I can tell that the blacklisted users must have a reason, default date and reporting entity
    // so I will just assume that they are blacklisted and return true.
    if (
      typeof userKarma.data === "object" &&
      (userKarma.data.reason || userKarma.data.default_date) &&
      typeof userKarma.data.reporting_entity === "object" &&
      userKarma.data.reporting_entity.name
    )
      return { isBlacklisted: true };

    return { isBlacklisted: false };
  }

  async completeLogin2Fa(trx: Knex.Knex.Transaction, sessionId: SessionModel["id"]) {
    await this.sessionRepository.updateSession(trx, sessionId, {
      isTwoFactorVerified: true,
      twoFactorCode: null,
      twoFactorCodeExpiresAt: null,
      twoFactorVerifiedAt: database.fn.now() as unknown as string,
    });
  }

  async completeUserKyc(
    trx: Knex.Knex.Transaction,
    userId: UserModel["id"],
    kycData: InitiateBvnVerificationRequest,
    bvnProfile: AdjutorBvnPayload,
  ) {
    if (env.NODE_ENV === "production") {
      if (
        kycData.dob !== bvnProfile.dob ||
        kycData.gender.toLowerCase() !== bvnProfile.gender.toLowerCase() ||
        kycData.firstName !== bvnProfile.first_name ||
        kycData.lastName !== bvnProfile.last_name
      )
        return { error: "Invalid KYC data provided. Please try again." };
    }

    const profile = await this.profileRepository.createUserProfile(trx, {
      address: bvnProfile.residential_address,
      bvn: kycData.bvn,
      bvnEmail: bvnProfile.email,
      bvnMetadata: Buffer.from(JSON.stringify(bvnProfile)).toString("base64"),
      bvnPhone: bvnProfile.mobile,
      dob: kycData.dob,
      firstName: kycData.firstName,
      gender: kycData.gender,
      image: bvnProfile.image_url,
      lastName: kycData.lastName,
      middleName: bvnProfile.middle_name,
      state: bvnProfile.state_of_origin,
      userId,
    });
    if (!profile) {
      return { error: "Failed to create user profile. Please try again." };
    }

    const user = await this.userRepository.updateUser(trx, userId, {
      isKycVerified: true,
      status: UserStatus.VERIFIED,
    });
    if (!user) {
      return { error: "Failed to update user. Please try again." };
    }

    return { profile, user };
  }

  async createUser(
    trx: Knex.Knex.Transaction,
    userData: Pick<UserModel, "email" | "password" | "phone" | "timezone">,
  ) {
    const hashedPassword = await hashPassword(userData.password);
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

  async createWallet(
    trx: Knex.Knex.Transaction,
    walletDate: Pick<WalletModel, "accountName" | "accountNumber" | "userId">,
  ) {
    const wallet = await this.walletRepository.createUserWallet(trx, {
      ...walletDate,
    });
    if (!wallet) {
      return { error: "Failed to create wallet. Please try again." };
    }

    return { wallet };
  }

  async deleteUserSession(trx: Knex.Knex.Transaction, userId: SessionModel["userId"]) {
    return await this.sessionRepository.deleteSession(trx, userId);
  }

  async generateLoginOtp(
    trx: Knex.Knex.Transaction,
    sessionData: Omit<VerificationTokenPayload, "authType" | "bvn" | "exp" | "type">,
  ) {
    const otp = generateOTP();
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

    await this.resendService.sendVerificationOTP(tokenPayload.email, otp, tokenTime);

    return {
      otpExpiresAt: tokenTime.toMillis(),
      otpMessage: `OTP sent to ${sessionData.email}, please check your email`,
      verificationToken,
    };
  }

  async getAuthUserData(sessionId: AuthenticatedUserModel["userId"]) {
    const userData = await this.authUserRepository.getUserBySessionId(sessionId);
    if (!userData)
      throw new CustomError(
        "Something happened, try logging in",
        StatusCodes.INTERNAL_SERVER_ERROR,
        {
          message: "User session not found",
        },
      );
    return { userData };
  }

  async getBvnData(bvn: ProfileModel["bvn"], otp: string) {
    const bvnData = await this.adjutorService.completeBvnVerification(bvn, otp);
    if (bvnData.status !== "success") return { error: bvnData.message };

    return { profile: bvnData.data };
  }

  async getValidatedUserSession(sessionData: Pick<SessionModel, "deviceId" | "id" | "userId">) {
    const session = await this.sessionRepository.getActiveSession(sessionData);
    if (!session) return { error: "Invalid credentials" };
    if (session.isTwoFactorVerified) return { error: "Session already verified" };

    return { session };
  }

  async initiateEmailVerification(
    trx: Knex.Knex.Transaction,
    sessionData: Omit<VerificationTokenPayload, "authType" | "bvn" | "exp" | "type">,
  ) {
    const otp = generateOTP();
    const tokenTime = DateTime.utc().plus({ seconds: env.VERIFICATION_TOKEN_EXPIRATION });
    const tokenPayload: VerificationTokenPayload = {
      ...sessionData,
      authType: TokenAuthType.EMAIL,
      exp: tokenTime.toUnixInteger(),
      type: TokenType.VERIFICATION,
    };
    const verificationToken = jwt.sign(tokenPayload, env.VERIFICATION_TOKEN_SECRET);
    await this.sessionRepository.updateSession(trx, sessionData.sessionId, {
      twoFactorCode: otp,
      twoFactorCodeExpiresAt: tokenTime.toSQL({ includeOffset: false }),
    });
    await this.resendService.sendEmailVerificationOTP(
      tokenPayload.email,
      getUsername(sessionData.email),
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

  async sendBvnConsent(bvn: ProfileModel["bvn"], phone: UserModel["phone"]) {
    const concent = await this.adjutorService.initiateBvnConcent(bvn, phone);
    if (concent.status === "otp") return { message: `${concent.message}: ${concent.data}` };

    return { error: concent.message };
  }

  async sendUserWelcomeEmail(email: UserModel["email"]) {
    await this.resendService.sendWelcomeEmail(email, getUsername(email));
  }

  async verifyUserEmail(
    trx: Knex.Knex.Transaction,
    sessionId: SessionModel["id"],
    userId: UserModel["id"],
  ) {
    const session = await this.sessionRepository.updateSession(trx, sessionId, {
      twoFactorCode: null,
      twoFactorCodeExpiresAt: null,
    });
    const user = await this.userRepository.updateUser(trx, userId, {
      isEmailVerified: true,
      isTwoFactorEnabled: true,
    });

    return { session, user };
  }

  async verifyUserLogin(email: UserModel["email"], password: UserModel["password"]) {
    const hashedPassword = await hashPassword(password);
    const user = await this.userRepository.getUserByEmailAndPassword(email, hashedPassword);
    if (!user) return { error: "Invalid email or password" };

    return { user };
  }
}
