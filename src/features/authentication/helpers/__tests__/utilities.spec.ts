/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TokenAuthType, TokenType } from "../../../../helpers/types.js";
import * as utilities from "../utilities.js";

vi.mock("jsonwebtoken");
vi.mock("../../../../configs/env.js", () => ({
  env: {
    ACCESS_TOKEN_EXPIRATION: 3600,
    ACCESS_TOKEN_SECRET: "access_secret",
    REFRESH_TOKEN_EXPIRATION: 7200,
    REFRESH_TOKEN_SECRET: "refresh_secret",
    VERIFICATION_TOKEN_EXPIRATION: 300,
    VERIFICATION_TOKEN_SECRET: "verification_secret",
  },
}));
vi.mock("../../../../validations/validationSchemas.js", () => ({
  tokenSchema: () => ({
    safeParse: (token: any) =>
      token.type === TokenType.REFRESH ? { data: token, success: true } : { success: false },
  }),
  verificationTokenSchema: () => ({
    safeParse: (token: any) =>
      token.type === TokenType.VERIFICATION ? { data: token, success: true } : { success: false },
  }),
}));

const sessionData = {
  deviceId: "device123",
  ipAddress: "127.0.0.1",
  userAgent: "test-agent",
  userId: "user123",
};

const verificationSessionData = {
  authType: TokenAuthType.BVN,
  deviceId: "device123",
  ipAddress: "127.0.0.1",
  userAgent: "test-agent",
  userId: "user123",
};

describe("utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (jwt.sign as any).mockImplementation(
      (payload: any, secret: any) => `${secret}.${payload.type}`,
    );
    (jwt.verify as any).mockImplementation((token: any, secret: any) => {
      if (token.startsWith(secret)) {
        if (secret === "refresh_secret") {
          return { ...sessionData, sessionId: "sess1", type: TokenType.REFRESH };
        }
        if (secret === "verification_secret") {
          return { ...verificationSessionData, type: TokenType.VERIFICATION };
        }
      }
      throw new Error("Invalid token");
    });
  });

  describe("generateAccessToken", () => {
    it("should generate an access token and expiration time", () => {
      const { accessToken, accessTokenTime } = utilities.generateAccessToken("sess1", sessionData);
      expect(accessToken).toBe("access_secret.access");
      expect(DateTime.isDateTime(accessTokenTime)).toBe(true);
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a refresh token and expiration time", () => {
      const { refreshToken, refreshTokenTime } = utilities.generateRefreshToken(
        "sess1",
        sessionData,
      );
      expect(refreshToken).toBe("refresh_secret.refresh");
      expect(DateTime.isDateTime(refreshTokenTime)).toBe(true);
    });
  });

  describe("generateVerificationToken", () => {
    it("should generate a verification token and expiration time", () => {
      const { tokenTime, verificationToken } = utilities.generateVerificationToken({
        authType: TokenAuthType.BVN,
        deviceId: "device123",
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
        userId: "user123",
      } as any);
      expect(verificationToken).toBe("verification_secret.verification");
      expect(DateTime.isDateTime(tokenTime)).toBe(true);
    });
  });

  describe("generateBvnVerificationToken", () => {
    it("should generate a BVN verification token with message and expiry", () => {
      const result = utilities.generateBvnVerificationToken(
        {
          deviceId: "device123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          userId: "user123",
        } as any,
        "Your OTP is 123456",
      );
      expect(result.otpMessage).toBe("Your OTP is 123456");
      expect(typeof result.otpExpiresAt).toBe("number");
      expect(result.verificationToken).toBe("verification_secret.verification");
    });
  });

  describe("generateOTP", () => {
    it("should generate a 6-digit OTP by default", () => {
      const otp = utilities.generateOTP();
      expect(typeof otp).toBe("string");
      expect(otp.length).toBe(6);
    });
    it("should generate an OTP of specified length", () => {
      const otp = utilities.generateOTP(4);
      expect(otp.length).toBe(4);
    });
  });

  describe("getUsername", () => {
    it("should return username from email", () => {
      expect(utilities.getUsername("john.doe@example.com")).toBe("@john.doe");
    });
  });

  describe("validateRefreshToken", () => {
    it("should validate a correct refresh token", () => {
      const result = utilities.validateRefreshToken("refresh_secret.REFRESH");
      expect(result).toHaveProperty("tokenPayload");
      expect(result.tokenPayload?.type).toBe(TokenType.REFRESH);
    });
    it("should return error for invalid refresh token", () => {
      (jwt.verify as any).mockImplementationOnce(() => {
        throw new Error("Invalid");
      });
      const result = utilities.validateRefreshToken("badtoken");
      expect(result).toHaveProperty("error");
    });
    it("should return error for invalid token type", () => {
      (jwt.verify as any).mockImplementationOnce(() => ({ type: "WRONG" }));
      const result = utilities.validateRefreshToken("refresh_secret.WRONG");
      expect(result).toHaveProperty("error");
    });
  });

  describe("validateVerificationToken", () => {
    it("should validate a correct verification token", () => {
      const result = utilities.validateVerificationToken(
        "verification_secret.VERIFICATION",
        TokenAuthType.BVN,
      );
      expect(result).toHaveProperty("tokenPayload");
      expect(result.tokenPayload?.type).toBe(TokenType.VERIFICATION);
    });
    it("should return error for invalid verification token", () => {
      (jwt.verify as any).mockImplementationOnce(() => {
        throw new Error("Invalid");
      });
      const result = utilities.validateVerificationToken("badtoken", TokenAuthType.BVN);
      expect(result).toHaveProperty("error");
    });
    it("should return error for invalid token type", () => {
      (jwt.verify as any).mockImplementationOnce(() => ({ type: "WRONG" }));
      const result = utilities.validateVerificationToken(
        "verification_secret.WRONG",
        TokenAuthType.BVN,
      );
      expect(result).toHaveProperty("error");
    });
  });
});
