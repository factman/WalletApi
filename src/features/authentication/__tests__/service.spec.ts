/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "../../../configs/env.js";
import * as utilities from "../../../helpers/utilities.js";
import { UserStatus } from "../../../models/UserModel.js";
import * as featureUtilities from "../helpers/utilities.js";
import { AuthenticationService } from "../service.js";

function mockRepositories() {
  return {
    adjutorService: {
      completeBvnVerification: vi.fn(),
      initiateBvnConcent: vi.fn(),
      karmaLookup: vi.fn(),
    },
    authUserRepository: {
      getUserBySessionId: vi.fn(),
    },
    profileRepository: {
      createUserProfile: vi.fn(),
    },
    resendService: {
      sendEmailVerificationOTP: vi.fn(),
      sendVerificationOTP: vi.fn(),
      sendWelcomeEmail: vi.fn(),
    },
    sessionRepository: {
      createSession: vi.fn(),
      deleteSession: vi.fn(),
      getActiveSession: vi.fn(),
      updateSession: vi.fn(),
    },
    userRepository: {
      blacklistUserById: vi.fn(),
      checkIfUserExist: vi.fn(),
      createUser: vi.fn(),
      getUserByEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    walletRepository: {
      createUserWallet: vi.fn(),
    },
  };
}

describe("AuthenticationService", () => {
  let service: AuthenticationService;
  let repos: ReturnType<typeof mockRepositories>;

  beforeEach(() => {
    repos = mockRepositories();
    service = new AuthenticationService(
      repos.userRepository as any,
      repos.sessionRepository as any,
      repos.resendService as any,
      repos.authUserRepository as any,
      repos.adjutorService as any,
      repos.profileRepository as any,
      repos.walletRepository as any,
    );
    vi.clearAllMocks();
  });

  describe("checkIfUserExists", () => {
    it("throws if both email and phone exist", async () => {
      repos.userRepository.checkIfUserExist.mockResolvedValue([{ email: "a@b.com", phone: "123" }]);
      await expect(service.checkIfUserExists("a@b.com", "123")).rejects.toThrow(
        "User already exist",
      );
    });

    it("throws if only email exists", async () => {
      repos.userRepository.checkIfUserExist.mockResolvedValue([{ email: "a@b.com", phone: "456" }]);
      await expect(service.checkIfUserExists("a@b.com", "123")).rejects.toThrow(
        "User already exist",
      );
    });

    it("throws if only phone exists", async () => {
      repos.userRepository.checkIfUserExist.mockResolvedValue([{ email: "c@d.com", phone: "123" }]);
      await expect(service.checkIfUserExists("a@b.com", "123")).rejects.toThrow(
        "User already exist",
      );
    });

    it("does not throw if neither exists", async () => {
      repos.userRepository.checkIfUserExist.mockResolvedValue([{ email: "x@y.com", phone: "999" }]);
      await expect(service.checkIfUserExists("a@b.com", "123")).resolves.toBeUndefined();
    });
  });

  describe("verifyUserLogin", () => {
    it("throws if user not found", async () => {
      repos.userRepository.getUserByEmail.mockResolvedValue(null);
      await expect(service.verifyUserLogin("a@b.com", "pass")).rejects.toThrow(
        "Invalid credentials",
      );
    });

    it("throws if password does not match", async () => {
      repos.userRepository.getUserByEmail.mockResolvedValue({ password: "hashed" });
      vi.spyOn(bcrypt, "compareSync").mockReturnValue(false);
      await expect(service.verifyUserLogin("a@b.com", "pass")).rejects.toThrow(
        "Invalid credentials",
      );
    });

    it("returns user if credentials are valid", async () => {
      const user = { password: "hashed" };
      repos.userRepository.getUserByEmail.mockResolvedValue(user);
      vi.spyOn(bcrypt, "compareSync").mockReturnValue(true);
      await expect(service.verifyUserLogin("a@b.com", "pass")).resolves.toEqual({ user });
    });
  });

  describe("getValidatedUserSession", () => {
    it("throws if session not found", async () => {
      repos.sessionRepository.getActiveSession.mockResolvedValue(null);
      await expect(
        service.getValidatedUserSession({ deviceId: "d", id: "i", userId: "u" }),
      ).rejects.toThrow("Login failed");
    });

    it("throws if session is already verified", async () => {
      repos.sessionRepository.getActiveSession.mockResolvedValue({ isTwoFactorVerified: true });
      await expect(
        service.getValidatedUserSession({ deviceId: "d", id: "i", userId: "u" }),
      ).rejects.toThrow("Login failed");
    });

    it("returns session if valid", async () => {
      const session = { isTwoFactorVerified: false };
      repos.sessionRepository.getActiveSession.mockResolvedValue(session);
      await expect(
        service.getValidatedUserSession({ deviceId: "d", id: "i", userId: "u" }),
      ).resolves.toEqual({ session });
    });
  });

  describe("getAuthUserData", () => {
    it("throws if userData not found", async () => {
      repos.authUserRepository.getUserBySessionId.mockResolvedValue(null);
      await expect(service.getAuthUserData("sessionId")).rejects.toThrow("Something happened");
    });

    it("returns userData if found", async () => {
      const userData = { id: "u" };
      repos.authUserRepository.getUserBySessionId.mockResolvedValue(userData);
      await expect(service.getAuthUserData("sessionId")).resolves.toEqual({ userData });
    });
  });

  describe("sendBvnConsent", () => {
    it("returns message if status is otp", async () => {
      repos.adjutorService.initiateBvnConcent.mockResolvedValue({
        data: "otp123",
        message: "msg",
        status: "otp",
      });
      await expect(service.sendBvnConsent("bvn", "phone")).resolves.toEqual({
        message: "msg: otp123",
      });
    });

    it("throws if status is not otp", async () => {
      repos.adjutorService.initiateBvnConcent.mockResolvedValue({
        message: "failmsg",
        status: "fail",
      });
      await expect(service.sendBvnConsent("bvn", "phone")).rejects.toThrow("Verification failed");
    });
  });

  describe("findUserByEmail", () => {
    it("throws if user not found", async () => {
      repos.userRepository.getUserByEmail.mockResolvedValue(null);
      await expect(service.findUserByEmail("a@b.com")).rejects.toThrow("Account not found");
    });

    it("returns user if found", async () => {
      const user = { id: "u" };
      repos.userRepository.getUserByEmail.mockResolvedValue(user);
      await expect(service.findUserByEmail("a@b.com")).resolves.toEqual({ user });
    });
  });

  describe("checkUserKarma", () => {
    it("throws if karmaLookup fails", async () => {
      repos.adjutorService.karmaLookup.mockResolvedValue({ message: "bad", status: "fail" });
      await expect(service.checkUserKarma("bvn")).rejects.toThrow("bad");
    });

    it("returns isBlacklisted true if blacklisted", async () => {
      repos.adjutorService.karmaLookup.mockResolvedValue({
        data: {
          default_date: "date",
          reason: "reason",
          reporting_entity: { name: "entity" },
        },
        status: "success",
      });
      await expect(service.checkUserKarma("bvn")).resolves.toEqual({ isBlacklisted: true });
    });

    it("returns isBlacklisted false if not blacklisted", async () => {
      repos.adjutorService.karmaLookup.mockResolvedValue({
        data: {},
        status: "success",
      });
      await expect(service.checkUserKarma("bvn")).resolves.toEqual({ isBlacklisted: false });
    });
  });
  describe("blackListUser", () => {
    it("calls deleteUserSession and blacklistUserById with correct arguments", async () => {
      const trx = {} as any;
      const userId = "user-123";
      await service.blackListUser(trx, userId);
      expect(repos.sessionRepository.deleteSession).toHaveBeenCalledWith(trx, userId);
      expect(repos.userRepository.blacklistUserById).toHaveBeenCalledWith(trx, userId);
    });

    it("propagates error if deleteUserSession throws", async () => {
      const trx = {} as any;
      const userId = "user-123";
      repos.sessionRepository.deleteSession.mockRejectedValue(new Error("fail"));
      await expect(service.blackListUser(trx, userId)).rejects.toThrow("fail");
      expect(repos.userRepository.blacklistUserById).not.toHaveBeenCalled();
    });

    it("propagates error if blacklistUserById throws", async () => {
      const trx = {} as any;
      const userId = "user-123";
      repos.userRepository.blacklistUserById.mockRejectedValue(new Error("fail2"));
      await expect(service.blackListUser(trx, userId)).rejects.toThrow("fail2");
    });
  });
  describe("completeLogin", () => {
    it("updates session and user with correct arguments", async () => {
      const trx = {} as any;
      const sessionId = "session-1";
      const userId = "user-1";
      await service.completeLogin(trx, sessionId, userId);
      expect(repos.sessionRepository.updateSession).toHaveBeenCalledWith(
        trx,
        sessionId,
        expect.objectContaining({
          isTwoFactorVerified: true,
          twoFactorCode: null,
          twoFactorCodeExpiresAt: null,
          twoFactorVerifiedAt: expect.anything(),
        }),
      );
      expect(repos.userRepository.updateUser).toHaveBeenCalledWith(
        trx,
        userId,
        expect.objectContaining({
          lastLogin: expect.anything(),
        }),
      );
    });

    it("propagates error if updateSession throws", async () => {
      const trx = {} as any;
      const sessionId = "session-1";
      const userId = "user-1";
      repos.sessionRepository.updateSession.mockRejectedValue(new Error("fail"));
      await expect(service.completeLogin(trx, sessionId, userId)).rejects.toThrow("fail");
      expect(repos.userRepository.updateUser).not.toHaveBeenCalled();
    });

    it("propagates error if updateUser throws", async () => {
      const trx = {} as any;
      const sessionId = "session-1";
      const userId = "user-1";
      repos.userRepository.updateUser.mockRejectedValue(new Error("fail2"));
      await expect(service.completeLogin(trx, sessionId, userId)).rejects.toThrow("fail2");
    });
  });
  describe("AuthenticationService - createUser", () => {
    it("creates a user with hashed password", async () => {
      const trx = {} as any;
      const userData = { email: "a@b.com", password: "plain", phone: "123", timezone: "UTC" };
      const hashed = "hashed-password";
      vi.spyOn(utilities, "hashPassword").mockResolvedValue(hashed);
      repos.userRepository.createUser.mockResolvedValue({ id: "u", ...userData, password: hashed });
      await expect(service.createUser(trx, userData)).resolves.toEqual({
        user: { id: "u", ...userData, password: hashed },
      });
      expect(repos.userRepository.createUser).toHaveBeenCalledWith(trx, {
        ...userData,
        password: hashed,
      });
    });

    it("throws if user creation fails", async () => {
      const trx = {} as any;
      const userData = { email: "a@b.com", password: "plain", phone: "123", timezone: "UTC" };
      vi.spyOn(utilities, "hashPassword").mockResolvedValue("hashed");
      repos.userRepository.createUser.mockResolvedValue(null);
      await expect(service.createUser(trx, userData)).rejects.toThrow("Unable to create user");
    });
  });

  describe("AuthenticationService - createUserSession", () => {
    it("creates a session and returns it", async () => {
      const trx = {} as any;
      const sessionData = {
        deviceId: "dev",
        ipAddress: "ip",
        userAgent: "ua",
        userId: "uid",
      };
      repos.sessionRepository.createSession.mockResolvedValue({ id: "sid", ...sessionData });
      vi.spyOn(featureUtilities, "generateAccessToken").mockReturnValue({
        accessToken: "at",
        accessTokenTime: { toJSDate: () => new Date() } as any,
      });
      vi.spyOn(featureUtilities, "generateRefreshToken").mockReturnValue({
        refreshToken: "rt",
        refreshTokenTime: { toJSDate: () => new Date() } as any,
      });
      vi.spyOn(crypto, "randomUUID").mockReturnValue("sid" as any);
      vi.spyOn(service, "deleteUserSession").mockResolvedValue(undefined);
      await expect(service.createUserSession(trx, sessionData)).resolves.toEqual({
        session: { id: "sid", ...sessionData },
      });
      expect(repos.sessionRepository.createSession).toHaveBeenCalled();
    });

    it("throws if session creation fails", async () => {
      const trx = {} as any;
      const sessionData = {
        deviceId: "dev",
        ipAddress: "ip",
        userAgent: "ua",
        userId: "uid",
      };
      repos.sessionRepository.createSession.mockResolvedValue(null);
      vi.spyOn(featureUtilities, "generateAccessToken").mockReturnValue({
        accessToken: "at",
        accessTokenTime: { toJSDate: () => new Date() } as any,
      });
      vi.spyOn(featureUtilities, "generateRefreshToken").mockReturnValue({
        refreshToken: "rt",
        refreshTokenTime: { toJSDate: () => new Date() } as any,
      });
      vi.spyOn(crypto, "randomUUID").mockReturnValue("sid" as any);
      vi.spyOn(service, "deleteUserSession").mockResolvedValue(undefined);
      await expect(service.createUserSession(trx, sessionData)).rejects.toThrow(
        "Unable to create user session",
      );
    });
  });

  describe("AuthenticationService - createWallet", () => {
    it("creates a wallet and returns it", async () => {
      const trx = {} as any;
      const walletData = { accountName: "n", accountNumber: "num", userId: "uid" };
      repos.walletRepository.createUserWallet.mockResolvedValue({ id: "wid", ...walletData });
      await expect(service.createWallet(trx, walletData)).resolves.toEqual({
        wallet: { id: "wid", ...walletData },
      });
      expect(repos.walletRepository.createUserWallet).toHaveBeenCalledWith(trx, walletData);
    });

    it("throws if wallet creation fails", async () => {
      const trx = {} as any;
      const walletData = { accountName: "n", accountNumber: "num", userId: "uid" };
      repos.walletRepository.createUserWallet.mockResolvedValue(null);
      await expect(service.createWallet(trx, walletData)).rejects.toThrow(
        "Unable to create wallet",
      );
    });
  });

  describe("AuthenticationService - enablePasswordReset", () => {
    it("calls updateUser with isPasswordResetRequired true", async () => {
      const trx = {} as any;
      const userId = "uid";
      repos.userRepository.updateUser.mockResolvedValue({
        id: userId,
        isPasswordResetRequired: true,
      });
      await expect(service.enablePasswordReset(trx, userId)).resolves.toEqual({
        id: userId,
        isPasswordResetRequired: true,
      });
      expect(repos.userRepository.updateUser).toHaveBeenCalledWith(trx, userId, {
        isPasswordResetRequired: true,
      });
    });
  });

  describe("AuthenticationService - resetUserPassword", () => {
    it("hashes password and updates user", async () => {
      const trx = {} as any;
      const userId = "uid";
      const password = "plain";
      const hashed = "hashed";
      vi.spyOn(utilities, "hashPassword").mockResolvedValue(hashed);
      repos.userRepository.updateUser.mockResolvedValue({ id: userId, password: hashed });
      await service.resetUserPassword(trx, userId, password);
      expect(repos.userRepository.updateUser).toHaveBeenCalledWith(trx, userId, {
        isPasswordResetRequired: false,
        password: hashed,
      });
    });
  });

  describe("AuthenticationService - sendUserWelcomeEmail", () => {
    it("calls sendWelcomeEmail with email and username", async () => {
      const email = "a@b.com";
      vi.spyOn(featureUtilities, "getUsername").mockReturnValue("user");
      await service.sendUserWelcomeEmail(email);
      expect(repos.resendService.sendWelcomeEmail).toHaveBeenCalledWith(email, "user");
    });
  });

  describe("AuthenticationService - verifyUserEmail", () => {
    it("updates session and user, returns both", async () => {
      const trx = {} as any;
      const sessionId = "sid";
      const userId = "uid";
      repos.sessionRepository.updateSession.mockResolvedValue({ id: sessionId });
      repos.userRepository.updateUser.mockResolvedValue({ id: userId });
      await expect(service.verifyUserEmail(trx, sessionId, userId)).resolves.toEqual({
        session: { id: sessionId },
        user: { id: userId },
      });
    });

    it("throws if session or user update fails", async () => {
      const trx = {} as any;
      const sessionId = "sid";
      const userId = "uid";
      repos.sessionRepository.updateSession.mockResolvedValue(null);
      repos.userRepository.updateUser.mockResolvedValue({ id: userId });
      await expect(service.verifyUserEmail(trx, sessionId, userId)).rejects.toThrow(
        "Failed to verify email",
      );
      repos.sessionRepository.updateSession.mockResolvedValue({ id: sessionId });
      repos.userRepository.updateUser.mockResolvedValue(null);
      await expect(service.verifyUserEmail(trx, sessionId, userId)).rejects.toThrow(
        "Failed to verify email",
      );
    });
  });
  describe("AuthenticationService - completeUserKyc", () => {
    const trx = {} as any;
    const userId = "user-kyc";
    const kycData = {
      bvn: "12345678901",
      dob: "1990-01-01",
      firstName: "John",
      gender: "Male",
      lastName: "Doe",
    };
    const bvnProfile = {
      dob: "1990-01-01",
      email: "bvn@email.com",
      first_name: "John",
      gender: "Male",
      image_url: "img.jpg",
      last_name: "Doe",
      middle_name: "Middle",
      mobile: "08012345678",
      residential_address: "123 Main St",
      state_of_origin: "Lagos",
    };

    beforeEach(() => {
      vi.spyOn(env, "NODE_ENV", "get").mockReturnValue("production");
    });

    it("throws if dob does not match in production", async () => {
      const badProfile = { ...bvnProfile, dob: "1991-01-01" };
      await expect(
        service.completeUserKyc(trx, userId, kycData, badProfile as any),
      ).rejects.toThrow("Unable to verify Bvn");
    });

    it("throws if gender does not match in production", async () => {
      const badProfile = { ...bvnProfile, gender: "Female" };
      await expect(
        service.completeUserKyc(trx, userId, kycData, badProfile as any),
      ).rejects.toThrow("Unable to verify Bvn");
    });

    it("throws if firstName does not match in production", async () => {
      const badProfile = { ...bvnProfile, first_name: "Jane" };
      await expect(
        service.completeUserKyc(trx, userId, kycData, badProfile as any),
      ).rejects.toThrow("Unable to verify Bvn");
    });

    it("throws if lastName does not match in production", async () => {
      const badProfile = { ...bvnProfile, last_name: "Smith" };
      await expect(
        service.completeUserKyc(trx, userId, kycData, badProfile as any),
      ).rejects.toThrow("Unable to verify Bvn");
    });

    it("creates profile and updates user if all data matches", async () => {
      const profile = { id: "profile-1" };
      const user = { id: userId, isKycVerified: true, status: "VERIFIED" };
      repos.profileRepository.createUserProfile.mockResolvedValue(profile);
      repos.userRepository.updateUser.mockResolvedValue(user);
      await expect(
        service.completeUserKyc(trx, userId, kycData, bvnProfile as any),
      ).resolves.toEqual({ profile, user });
      expect(repos.profileRepository.createUserProfile).toHaveBeenCalledWith(
        trx,
        expect.objectContaining({
          address: bvnProfile.residential_address,
          bvn: kycData.bvn,
          bvnEmail: bvnProfile.email,
          bvnMetadata: expect.any(String),
          bvnPhone: bvnProfile.mobile,
          dob: kycData.dob,
          firstName: kycData.firstName,
          gender: kycData.gender,
          image: bvnProfile.image_url,
          lastName: kycData.lastName,
          middleName: bvnProfile.middle_name,
          state: bvnProfile.state_of_origin,
          userId,
        }),
      );
      expect(repos.userRepository.updateUser).toHaveBeenCalledWith(
        trx,
        userId,
        expect.objectContaining({
          isKycVerified: true,
          status: UserStatus.VERIFIED,
        }),
      );
    });

    it("throws if profile creation fails", async () => {
      repos.profileRepository.createUserProfile.mockResolvedValue(null);
      await expect(
        service.completeUserKyc(trx, userId, kycData, bvnProfile as any),
      ).rejects.toThrow("Unable to verify Bvn");
    });

    it("throws if user update fails", async () => {
      repos.profileRepository.createUserProfile.mockResolvedValue({ id: "profile-1" });
      repos.userRepository.updateUser.mockResolvedValue(null);
      await expect(
        service.completeUserKyc(trx, userId, kycData, bvnProfile as any),
      ).rejects.toThrow("Unable to verify Bvn");
    });

    it("does not check strict match if not production", async () => {
      vi.spyOn(env, "NODE_ENV", "get").mockReturnValue("development");
      const profile = { id: "profile-2" };
      const user = { id: userId, isKycVerified: true, status: "VERIFIED" };
      repos.profileRepository.createUserProfile.mockResolvedValue(profile);
      repos.userRepository.updateUser.mockResolvedValue(user);
      await expect(
        service.completeUserKyc(
          trx,
          userId,
          { ...kycData, firstName: "Mismatch" },
          bvnProfile as any,
        ),
      ).resolves.toEqual({ profile, user });
    });
  });
  describe("AuthenticationService - generateForgotPasswordOtp", () => {
    const trx = {} as any;
    const sessionData = {
      deviceId: "dev-1",
      email: "test@example.com",
      ipAddress: "127.0.0.1",
      userAgent: "agent",
      userId: "user-1",
    };

    beforeEach(() => {
      vi.spyOn(featureUtilities, "generateOTP").mockReturnValue("123456");
      vi.spyOn(featureUtilities, "generateVerificationToken").mockReturnValue({
        tokenTime: {
          toJSDate: () => new Date(2024, 0, 1, 0, 0, 0),
          toMillis: () => 1704067200000,
        } as any,
        verificationToken: "token-abc",
      });
      vi.spyOn(service, "createUserSession").mockResolvedValue({
        session: { id: "session-1", ...sessionData } as any,
      });
      repos.sessionRepository.updateSession.mockResolvedValue({});
      repos.resendService.sendVerificationOTP.mockResolvedValue(undefined);
    });

    it("creates a session, updates session with OTP, sends OTP, and returns correct data", async () => {
      await expect(service.generateForgotPasswordOtp(trx, sessionData)).resolves.toEqual({
        otpExpiresAt: 1704067200000,
        otpMessage: `OTP sent to ${sessionData.email}, please check your email`,
        verificationToken: "token-abc",
      });
      expect(service.createUserSession).toHaveBeenCalledWith(trx, {
        deviceId: sessionData.deviceId,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        userId: sessionData.userId,
      });
      expect(repos.sessionRepository.updateSession).toHaveBeenCalledWith(
        trx,
        "session-1",
        expect.objectContaining({
          twoFactorCode: "123456",
          twoFactorCodeExpiresAt: expect.any(Date),
        }),
      );
      expect(repos.resendService.sendVerificationOTP).toHaveBeenCalledWith(
        sessionData.email,
        "123456",
        expect.objectContaining({ toJSDate: expect.any(Function), toMillis: expect.any(Function) }),
      );
    });

    it("throws if createUserSession throws", async () => {
      (service.createUserSession as any).mockRejectedValueOnce(new Error("fail-create-session"));
      await expect(service.generateForgotPasswordOtp(trx, sessionData)).rejects.toThrow(
        "fail-create-session",
      );
    });

    it("throws if updateSession throws", async () => {
      repos.sessionRepository.updateSession.mockRejectedValueOnce(new Error("fail-update-session"));
      await expect(service.generateForgotPasswordOtp(trx, sessionData)).rejects.toThrow(
        "fail-update-session",
      );
    });

    it("throws if sendVerificationOTP throws", async () => {
      repos.resendService.sendVerificationOTP.mockRejectedValueOnce(new Error("fail-send-otp"));
      await expect(service.generateForgotPasswordOtp(trx, sessionData)).rejects.toThrow(
        "fail-send-otp",
      );
    });
  });
  describe("AuthenticationService - generateLoginOtp", () => {
    const trx = {} as any;
    const sessionData = {
      deviceId: "dev-2",
      email: "login@example.com",
      ipAddress: "192.168.1.1",
      sessionId: "session-login",
      userAgent: "agent-login",
      userId: "user-2",
    };

    beforeEach(() => {
      vi.spyOn(featureUtilities, "generateOTP").mockReturnValue("654321");
      vi.spyOn(featureUtilities, "generateVerificationToken").mockReturnValue({
        tokenTime: {
          toJSDate: () => new Date(2024, 1, 1, 0, 0, 0),
          toMillis: () => 1706745600000,
        } as any,
        verificationToken: "token-login",
      });
      repos.sessionRepository.updateSession.mockResolvedValue({});
      repos.resendService.sendVerificationOTP.mockResolvedValue(undefined);
    });

    it("updates session with OTP, sends OTP, and returns correct data", async () => {
      await expect(service.generateLoginOtp(trx, sessionData)).resolves.toEqual({
        otpExpiresAt: 1706745600000,
        otpMessage: `OTP sent to ${sessionData.email}, please check your email`,
        verificationToken: "token-login",
      });
      expect(repos.sessionRepository.updateSession).toHaveBeenCalledWith(
        trx,
        sessionData.sessionId,
        expect.objectContaining({
          isTwoFactorVerified: false,
          twoFactorCode: "654321",
          twoFactorCodeExpiresAt: expect.any(Date),
          twoFactorVerifiedAt: null,
        }),
      );
      expect(repos.resendService.sendVerificationOTP).toHaveBeenCalledWith(
        sessionData.email,
        "654321",
        expect.objectContaining({ toJSDate: expect.any(Function), toMillis: expect.any(Function) }),
      );
    });

    it("throws if updateSession throws", async () => {
      repos.sessionRepository.updateSession.mockRejectedValueOnce(
        new Error("fail-update-login-session"),
      );
      await expect(service.generateLoginOtp(trx, sessionData)).rejects.toThrow(
        "fail-update-login-session",
      );
    });

    it("throws if sendVerificationOTP throws", async () => {
      repos.resendService.sendVerificationOTP.mockRejectedValueOnce(
        new Error("fail-send-login-otp"),
      );
      await expect(service.generateLoginOtp(trx, sessionData)).rejects.toThrow(
        "fail-send-login-otp",
      );
    });
  });
  describe("AuthenticationService - getBvnData", () => {
    it("returns profile if bvn verification is successful", async () => {
      const bvn = "12345678901";
      const otp = "123456";
      const profileData = { some: "profile" };
      repos.adjutorService.completeBvnVerification.mockResolvedValue({
        data: profileData,
        status: "success",
      });
      await expect(service.getBvnData(bvn, otp)).resolves.toEqual({ profile: profileData });
      expect(repos.adjutorService.completeBvnVerification).toHaveBeenCalledWith(bvn, otp);
    });

    it("throws if bvn verification fails", async () => {
      const bvn = "12345678901";
      const otp = "123456";
      repos.adjutorService.completeBvnVerification.mockResolvedValue({
        message: "BVN verification failed",
        status: "fail",
      });
      await expect(service.getBvnData(bvn, otp)).rejects.toThrow("Unable to verify Bvn");
      expect(repos.adjutorService.completeBvnVerification).toHaveBeenCalledWith(bvn, otp);
    });
  });
  describe("AuthenticationService - initiateEmailVerification", () => {
    const trx = {} as any;
    const sessionData = {
      deviceId: "dev-email",
      email: "verify@example.com",
      ipAddress: "10.0.0.1",
      sessionId: "session-email",
      userAgent: "agent-email",
      userId: "user-email",
    };

    beforeEach(() => {
      vi.spyOn(featureUtilities, "generateOTP").mockReturnValue("999888");
      vi.spyOn(featureUtilities, "generateVerificationToken").mockReturnValue({
        tokenTime: {
          toJSDate: () => new Date(2024, 2, 1, 0, 0, 0),
          toMillis: () => 1709251200000,
        } as any,
        verificationToken: "token-email",
      });
      vi.spyOn(featureUtilities, "getUsername").mockReturnValue("verifyuser");
      repos.sessionRepository.updateSession.mockResolvedValue({});
      repos.resendService.sendEmailVerificationOTP.mockResolvedValue(undefined);
    });

    it("updates session, sends email verification OTP, and returns correct data", async () => {
      await expect(service.initiateEmailVerification(trx, sessionData)).resolves.toEqual({
        otpExpiresAt: 1709251200000,
        otpMessage:
          "A One-Time Password (OTP) has been sent to your email address. Please check your inbox and verify your email using the OTP.",
        verificationToken: "token-email",
      });
      expect(repos.sessionRepository.updateSession).toHaveBeenCalledWith(
        trx,
        sessionData.sessionId,
        expect.objectContaining({
          twoFactorCode: "999888",
          twoFactorCodeExpiresAt: expect.any(Date),
        }),
      );
      expect(repos.resendService.sendEmailVerificationOTP).toHaveBeenCalledWith(
        sessionData.email,
        "verifyuser",
        "999888",
        expect.objectContaining({ toJSDate: expect.any(Function), toMillis: expect.any(Function) }),
      );
    });

    it("throws if updateSession fails", async () => {
      repos.sessionRepository.updateSession.mockRejectedValueOnce(new Error("fail-update-session"));
      await expect(service.initiateEmailVerification(trx, sessionData)).rejects.toThrow(
        "fail-update-session",
      );
      expect(repos.resendService.sendEmailVerificationOTP).not.toHaveBeenCalled();
    });

    it("throws if sendEmailVerificationOTP fails", async () => {
      repos.resendService.sendEmailVerificationOTP.mockRejectedValueOnce(
        new Error("fail-send-otp"),
      );
      await expect(service.initiateEmailVerification(trx, sessionData)).rejects.toThrow(
        "fail-send-otp",
      );
    });
  });
  describe("AuthenticationService - refreshSessionTokens", () => {
    const trx = {} as any;
    const sessionId = "session-refresh";
    const sessionData = {
      deviceId: "dev-refresh",
      ipAddress: "10.10.10.10",
      userAgent: "agent-refresh",
      userId: "user-refresh",
    };

    beforeEach(() => {
      vi.spyOn(featureUtilities, "generateAccessToken").mockReturnValue({
        accessToken: "access-token",
        accessTokenTime: { toJSDate: () => new Date(2024, 3, 1, 0, 0, 0) } as any,
      });
      vi.spyOn(featureUtilities, "generateRefreshToken").mockReturnValue({
        refreshToken: "refresh-token",
        refreshTokenTime: { toJSDate: () => new Date(2024, 3, 2, 0, 0, 0) } as any,
      });
      repos.sessionRepository.updateSession.mockReset();
    });

    it("updates session with new tokens and returns session", async () => {
      const updatedSession = { id: sessionId, ...sessionData };
      repos.sessionRepository.updateSession.mockResolvedValue(updatedSession);
      await expect(service.refreshSessionTokens(trx, sessionId, sessionData)).resolves.toEqual({
        session: updatedSession,
      });
      expect(repos.sessionRepository.updateSession).toHaveBeenCalledWith(
        trx,
        sessionId,
        expect.objectContaining({
          accessToken: "access-token",
          accessTokenExpiresAt: expect.any(Date),
          expiresAt: expect.any(Date),
          refreshToken: "refresh-token",
          refreshTokenExpiresAt: expect.any(Date),
        }),
      );
    });

    it("throws if session update fails", async () => {
      repos.sessionRepository.updateSession.mockResolvedValue(null);
      await expect(service.refreshSessionTokens(trx, sessionId, sessionData)).rejects.toThrow(
        "Error refreshing token",
      );
    });
  });
});
