import { z } from "zod";

import { buildStrictSchema } from "@/helpers/validations";

import {
  ForgotPasswordRequest,
  InitiateAuthenticationRequest,
  InitiateBvnVerificationRequest,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  ResendEmailVerificationRequest,
  ResetPasswordRequest,
  SignupRequest,
  VerifyBvnRequest,
  VerifyEmailRequest,
  VerifyForgotPasswordRequest,
} from "./authenticationDTOs";

export const forgotPasswordRequestSchema = buildStrictSchema<ForgotPasswordRequest>({
  deviceId: z.string().nonempty(),
  email: z.string().email(),
});

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(32, { message: "Password must be no more than 32 characters long" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[!@#$%^&*(),.?":{}|<>~`[\]\-=+_]/, {
    message: "Password must contain at least one special character",
  });

const bvnSchema = z
  .string()
  .length(11, { message: "BVN must be exactly 11 digits" })
  .regex(/^\d+$/, { message: "BVN must contain only digits" });

const otpSchema = z
  .string()
  .nonempty()
  .length(6, { message: "OTP must be exactly 6 digits" })
  .regex(/^\d+$/, { message: "OTP must contain only digits" });

export const initiateAuthenticationRequestSchema = buildStrictSchema<InitiateAuthenticationRequest>(
  {
    deviceId: z.string().nonempty(),
    email: z.string().email(),
    password: z.string().nonempty(),
  },
);

export const initiateBvnVerificationRequestSchema =
  buildStrictSchema<InitiateBvnVerificationRequest>({
    bvn: bvnSchema,
    dob: z.string().date(),
    firstName: z.string().nonempty(),
    gender: z
      .string()
      .nonempty()
      .toUpperCase()
      .refine((val) => ["FEMALE", "MALE"].includes(val)),
    lastName: z.string().nonempty(),
  });

export const loginRequestSchema = buildStrictSchema<LoginRequest>({
  deviceId: z.string().nonempty(),
  otp: otpSchema,
  verificationToken: z.string().jwt(),
});

export const logoutRequestSchema = buildStrictSchema<LogoutRequest>({
  userId: z.string().uuid(),
});

export const refreshTokenRequestSchema = buildStrictSchema<RefreshTokenRequest>({
  deviceId: z.string().nonempty(),
  refreshToken: z.string().jwt(),
  userId: z.string().uuid(),
});

export const resendEmailVerificationRequestSchema =
  buildStrictSchema<ResendEmailVerificationRequest>({
    email: z.string().email(),
  });

export const resetPasswordRequestSchema = buildStrictSchema<ResetPasswordRequest>({
  deviceId: z.string().nonempty(),
  newPassword: passwordSchema,
  oldPassword: z.string().nonempty(),
  verificationToken: z.string().jwt(),
});

export const updatePasswordRequestSchema = resetPasswordRequestSchema.omit({
  verificationToken: true,
});

const phoneNumberSchema = z
  .string()
  .nonempty()
  .startsWith("0")
  .length(11, { message: "Phone number must be exactly 11 digits" });

export const signupRequestSchema = buildStrictSchema<SignupRequest>({
  deviceId: z.string().nonempty(),
  email: z.string().email(),
  password: passwordSchema,
  phone: phoneNumberSchema,
  timezone: z.string().nonempty(),
});

export const verifyBvnRequestSchema = buildStrictSchema<VerifyBvnRequest>({
  otp: otpSchema,
  verificationToken: z.string().jwt(),
});

export const verifyEmailRequestSchema = buildStrictSchema<VerifyEmailRequest>({
  otp: otpSchema,
  verificationToken: z.string().jwt(),
});

export const verifyForgotPasswordRequestSchema = buildStrictSchema<VerifyForgotPasswordRequest>({
  otp: otpSchema,
  verificationToken: z.string().jwt(),
});
