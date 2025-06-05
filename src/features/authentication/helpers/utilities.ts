import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";

import { env } from "@/configs/env";
import { TokenAuthType, TokenPayload, TokenType, VerificationTokenPayload } from "@/helpers/types";
import SessionModel from "@/models/SessionModel";
import UserModel from "@/models/UserModel";
import { tokenSchema, verificationTokenSchema } from "@/validations/validationSchemas";

export function generateAccessToken(
  sessionId: SessionModel["id"],
  sessionData: Pick<SessionModel, "deviceId" | "ipAddress" | "userAgent" | "userId">,
) {
  const accessTokenTime = DateTime.utc().plus({ seconds: env.ACCESS_TOKEN_EXPIRATION });
  const tokenPayload: TokenPayload = {
    ...sessionData,
    exp: accessTokenTime.toUnixInteger(),
    sessionId,
    type: TokenType.ACCESS,
  };

  const accessToken = jwt.sign(tokenPayload, env.ACCESS_TOKEN_SECRET);

  return { accessToken, accessTokenTime };
}

export function generateBvnVerificationToken(
  sessionData: Omit<VerificationTokenPayload, "authType" | "exp" | "type">,
  message: string,
) {
  const { tokenTime, verificationToken } = generateVerificationToken({
    ...sessionData,
    authType: TokenAuthType.BVN,
  });

  return {
    otpExpiresAt: tokenTime.toMillis(),
    otpMessage: message,
    verificationToken,
  };
}

export function generateOTP(length = 6) {
  return Math.random().toString().slice(-length);
}

export function generateRefreshToken(
  sessionId: SessionModel["id"],
  sessionData: Pick<SessionModel, "deviceId" | "ipAddress" | "userAgent" | "userId">,
) {
  const refreshTokenTime = DateTime.utc().plus({ seconds: env.REFRESH_TOKEN_EXPIRATION });
  const tokenPayload: TokenPayload = {
    ...sessionData,
    exp: refreshTokenTime.toUnixInteger(),
    ipAddress: sessionData.ipAddress,
    sessionId,
    type: TokenType.REFRESH,
  };
  const refreshToken = jwt.sign(tokenPayload, env.REFRESH_TOKEN_SECRET);

  return { refreshToken, refreshTokenTime };
}

export function generateVerificationToken(
  sessionData: Omit<VerificationTokenPayload, "bvn" | "exp" | "type">,
) {
  const tokenTime = DateTime.utc().plus({ seconds: env.VERIFICATION_TOKEN_EXPIRATION });
  const tokenPayload: VerificationTokenPayload = {
    ...sessionData,
    exp: tokenTime.toUnixInteger(),
    type: TokenType.VERIFICATION,
  };
  const verificationToken = jwt.sign(tokenPayload, env.VERIFICATION_TOKEN_SECRET);

  return { tokenTime, verificationToken };
}

export function getUsername(email: UserModel["email"]) {
  return `@${email.split("@")[0]}`;
}

export async function hashPassword(password: UserModel["password"]) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

export function validateRefreshToken(token: string) {
  try {
    const validToken = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
    const result = tokenSchema(TokenType.REFRESH).safeParse(validToken);
    if (!result.success) return { error: "Invalid or expired credentials" };

    return { tokenPayload: validToken };
  } catch (err) {
    console.log("Invalid refresh token:", err);
    return { error: "Invalid or expired credentials" };
  }
}

export function validateVerificationToken(token: string, authType: TokenAuthType) {
  const error = "Invalid or expired credentials";

  try {
    const validToken = jwt.verify(token, env.VERIFICATION_TOKEN_SECRET) as VerificationTokenPayload;
    const result = verificationTokenSchema(authType).safeParse(validToken);
    if (!result.success) return { error };

    return { tokenPayload: result.data };
  } catch (err) {
    console.log("Invalid verification token:", err);
    return { error };
  }
}
