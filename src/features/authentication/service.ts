import { StatusCodes } from "http-status-codes";
import Knex from "knex";
import { randomUUID } from "node:crypto";

import database from "../../configs/database.js";
import { env } from "../../configs/env.js";
import { CustomError } from "../../helpers/errorInstance.js";
import { TokenAuthType, VerificationTokenPayload } from "../../helpers/types.js";
import { hashPassword } from "../../helpers/utilities.js";
import AuthenticatedUserModel from "../../models/AuthenticatedUserModel.js";
import ProfileModel from "../../models/ProfileModel.js";
import SessionModel from "../../models/SessionModel.js";
import UserModel, { UserStatus } from "../../models/UserModel.js";
import WalletModel from "../../models/WalletModel.js";
import { AuthenticatedUserRepository } from "../../repositories/AuthenticatedUserRepository.js";
import { ProfileRepository } from "../../repositories/ProfileRepository.js";
import { SessionRepository } from "../../repositories/SessionRepository.js";
import { UserRepository } from "../../repositories/UserRepository.js";
import { WalletRepository } from "../../repositories/WalletRepository.js";
import { AdjutorBvnPayload, AdjutorService } from "../../services/AdjutorService.js";
import { ResendService } from "../../services/ResendService.js";
import { InitiateBvnVerificationRequest } from "./authenticationDTOs.js";
import {
  generateAccessToken,
  generateOTP,
  generateRefreshToken,
  generateVerificationToken,
  getUsername,
} from "./helpers/utilities.js";

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
      throw new CustomError("User already exist", StatusCodes.BAD_REQUEST, {
        message: "User with this email and phone number already exists.",
      });

    if (found.email)
      throw new CustomError("User already exist", StatusCodes.BAD_REQUEST, {
        message: "User with this email already exists.",
      });

    if (found.phone)
      throw new CustomError("User already exist", StatusCodes.BAD_REQUEST, {
        message: "User with this phone number already exists.",
      });
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

  async completeLogin(
    trx: Knex.Knex.Transaction,
    sessionId: SessionModel["id"],
    userId: UserModel["id"],
  ) {
    await this.sessionRepository.updateSession(trx, sessionId, {
      isTwoFactorVerified: true,
      twoFactorCode: null,
      twoFactorCodeExpiresAt: null,
      twoFactorVerifiedAt: database.fn.now() as unknown as string,
    });
    await this.userRepository.updateUser(trx, userId, {
      lastLogin: database.fn.now() as unknown as string,
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
        throw new CustomError("Unable to verify Bvn", StatusCodes.BAD_REQUEST, {
          message: "Invalid KYC data provided. Please try again.",
        });
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
    if (!profile)
      throw new CustomError("Unable to verify Bvn", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Failed to create user profile. Please try again.",
      });

    const user = await this.userRepository.updateUser(trx, userId, {
      isKycVerified: true,
      status: UserStatus.VERIFIED,
    });
    if (!user)
      throw new CustomError("Unable to verify Bvn", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Failed to update user. Please try again.",
      });

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

    if (!user)
      throw new CustomError("Unable to create user", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Failed to create user. Please try again.",
      });

    return { user };
  }

  async createUserSession(
    trx: Knex.Knex.Transaction,
    sessionData: Pick<SessionModel, "deviceId" | "ipAddress" | "userAgent" | "userId">,
  ) {
    await this.deleteUserSession(trx, sessionData.userId);

    const sessionId = randomUUID();
    const { accessToken, accessTokenTime } = generateAccessToken(sessionId, sessionData);
    const { refreshToken, refreshTokenTime } = generateRefreshToken(sessionId, sessionData);
    const session = await this.sessionRepository.createSession(trx, {
      ...sessionData,
      accessToken,
      accessTokenExpiresAt: accessTokenTime.toSQL({ includeOffset: false }),
      expiresAt: refreshTokenTime.toSQL({ includeOffset: false }),
      id: sessionId,
      refreshToken,
      refreshTokenExpiresAt: refreshTokenTime.toSQL({ includeOffset: false }),
    });

    if (!session)
      throw new CustomError("Unable to create user session", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Failed to create user session. Please try again.",
      });

    return { session };
  }

  async createWallet(
    trx: Knex.Knex.Transaction,
    walletDate: Pick<WalletModel, "accountName" | "accountNumber" | "userId">,
  ) {
    const wallet = await this.walletRepository.createUserWallet(trx, {
      ...walletDate,
    });
    if (!wallet)
      throw new CustomError("Unable to create wallet", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Failed to create wallet. Please try again.",
      });

    return { wallet };
  }

  async deleteUserSession(trx: Knex.Knex.Transaction, userId: SessionModel["userId"]) {
    await this.sessionRepository.deleteSession(trx, userId);
  }

  async enablePasswordReset(trx: Knex.Knex.Transaction, userId: SessionModel["userId"]) {
    return await this.userRepository.updateUser(trx, userId, {
      isPasswordResetRequired: true,
    });
  }

  async findUserByEmail(email: UserModel["email"]) {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user)
      throw new CustomError("Account not found", StatusCodes.BAD_REQUEST, {
        message: "No account with this email found.",
      });

    return { user };
  }

  async generateForgotPasswordOtp(
    trx: Knex.Knex.Transaction,
    sessionData: Omit<VerificationTokenPayload, "authType" | "bvn" | "exp" | "sessionId" | "type">,
  ) {
    const otp = generateOTP();
    const { session } = await this.createUserSession(trx, {
      deviceId: sessionData.deviceId,
      ipAddress: sessionData.ipAddress,
      userAgent: sessionData.userAgent,
      userId: sessionData.userId,
    });

    const { tokenTime, verificationToken } = generateVerificationToken({
      ...sessionData,
      authType: TokenAuthType.FORGOT_PASSWORD,
      sessionId: session.id,
    });

    await this.resendService.sendVerificationOTP(sessionData.email, otp, tokenTime);

    return {
      otpExpiresAt: tokenTime.toMillis(),
      otpMessage: `OTP sent to ${sessionData.email}, please check your email`,
      verificationToken,
    };
  }

  async generateLoginOtp(
    trx: Knex.Knex.Transaction,
    sessionData: Omit<VerificationTokenPayload, "authType" | "bvn" | "exp" | "type">,
  ) {
    const otp = generateOTP();
    const { tokenTime, verificationToken } = generateVerificationToken({
      ...sessionData,
      authType: TokenAuthType.LOGIN,
    });
    await this.sessionRepository.updateSession(trx, sessionData.sessionId, {
      isTwoFactorVerified: false,
      twoFactorCode: otp,
      twoFactorCodeExpiresAt: tokenTime.toSQL({ includeOffset: false }),
      twoFactorVerifiedAt: null,
    });

    await this.resendService.sendVerificationOTP(sessionData.email, otp, tokenTime);

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
    if (bvnData.status !== "success")
      throw new CustomError("Unable to verify Bvn", StatusCodes.BAD_REQUEST, {
        message: bvnData.message,
      });

    return { profile: bvnData.data };
  }

  async getValidatedUserSession(sessionData: Pick<SessionModel, "deviceId" | "id" | "userId">) {
    const session = await this.sessionRepository.getActiveSession(sessionData);
    if (!session)
      throw new CustomError("Login failed", StatusCodes.BAD_REQUEST, {
        message: "Invalid credentials",
      });

    if (session.isTwoFactorVerified)
      throw new CustomError("Login failed", StatusCodes.BAD_REQUEST, {
        message: "Session already verified",
      });

    return { session };
  }

  async initiateEmailVerification(
    trx: Knex.Knex.Transaction,
    sessionData: Omit<VerificationTokenPayload, "authType" | "bvn" | "exp" | "type">,
  ) {
    const otp = generateOTP();
    const { tokenTime, verificationToken } = generateVerificationToken({
      ...sessionData,
      authType: TokenAuthType.EMAIL,
    });
    await this.sessionRepository.updateSession(trx, sessionData.sessionId, {
      twoFactorCode: otp,
      twoFactorCodeExpiresAt: tokenTime.toSQL({ includeOffset: false }),
    });
    await this.resendService.sendEmailVerificationOTP(
      sessionData.email,
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

  async refreshSessionTokens(
    trx: Knex.Knex.Transaction,
    sessionId: SessionModel["id"],
    sessionData: Pick<SessionModel, "deviceId" | "ipAddress" | "userAgent" | "userId">,
  ) {
    const { accessToken, accessTokenTime } = generateAccessToken(sessionId, sessionData);
    const { refreshToken, refreshTokenTime } = generateRefreshToken(sessionId, sessionData);
    const session = await this.sessionRepository.updateSession(trx, sessionId, {
      accessToken,
      accessTokenExpiresAt: accessTokenTime.toSQL({ includeOffset: false }),
      expiresAt: refreshTokenTime.toSQL({ includeOffset: false }),
      refreshToken,
      refreshTokenExpiresAt: refreshTokenTime.toSQL({ includeOffset: false }),
    });
    if (!session)
      throw new CustomError("Error refreshing token", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Failed to refresh user token. Please try again.",
      });

    return { session };
  }

  async resetUserPassword(
    trx: Knex.Knex.Transaction,
    userId: UserModel["id"],
    password: UserModel["password"],
  ) {
    const hashedPassword = await hashPassword(password);
    await this.userRepository.updateUser(trx, userId, {
      isPasswordResetRequired: false,
      password: hashedPassword,
    });
  }

  async sendBvnConsent(bvn: ProfileModel["bvn"], phone: UserModel["phone"]) {
    const concent = await this.adjutorService.initiateBvnConcent(bvn, phone);
    if (concent.status === "otp") return { message: `${concent.message}: ${concent.data}` };

    throw new CustomError("Verification failed", StatusCodes.BAD_REQUEST, {
      message: concent.message,
    });
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
    if (!session || !user)
      throw new CustomError("Failed to verify email", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Failed to verify email address. Please try again.",
      });

    return { session, user };
  }

  async verifyUserLogin(email: UserModel["email"], password: UserModel["password"]) {
    const hashedPassword = await hashPassword(password);
    const user = await this.userRepository.getUserByEmailAndPassword(email, hashedPassword);
    if (!user)
      throw new CustomError("Invalid credentials", StatusCodes.BAD_REQUEST, {
        message: "Invalid credentials. check and try again",
      });

    return { user };
  }
}
