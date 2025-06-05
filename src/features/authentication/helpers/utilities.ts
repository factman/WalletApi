import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";

import { env } from "@/configs/env";
import { TokenAuthType, TokenType, VerificationTokenPayload } from "@/helpers/types";
import UserModel from "@/models/UserModel";
import { verificationTokenSchema } from "@/validations/validationSchemas";

export function generateBvnVerificationToken(
  sessionData: Omit<VerificationTokenPayload, "authType" | "exp" | "type">,
  message: string,
) {
  const tokenTime = DateTime.utc().plus({ seconds: env.VERIFICATION_TOKEN_EXPIRATION });
  const tokenPayload: VerificationTokenPayload = {
    ...sessionData,
    authType: TokenAuthType.BVN,
    exp: tokenTime.toUnixInteger(),
    type: TokenType.VERIFICATION,
  };
  const verificationToken = jwt.sign(tokenPayload, env.VERIFICATION_TOKEN_SECRET);

  return {
    otpExpiresAt: tokenTime.toMillis(),
    otpMessage: message,
    verificationToken,
  };
}

export function generateOTP(length = 6) {
  return Math.random().toString().slice(-length);
}

export function getUsername(email: UserModel["email"]) {
  return `@${email.split("@")[0]}`;
}

export async function hashPassword(password: UserModel["password"]) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
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
