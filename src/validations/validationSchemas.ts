import { z } from "zod";

import { TokenAuthType, TokenType } from "../helpers/types.js";
import { buildHeaderSchema, buildStrictSchema } from "../helpers/validations.js";

export function authorizationSchema(message: string) {
  return buildHeaderSchema({
    authorization: z.string({ message }).nonempty(message).startsWith("Bearer", message),
  });
}

const baseTokenSchema = z.object({
  deviceId: z.string().nonempty("Device ID is required"),
  exp: z.number(),
  ipAddress: z.string().ip().nonempty("IP Address is required"),
  sessionId: z.string().uuid().nonempty("Session ID is required"),
  userAgent: z.string().nonempty("User Agent is required"),
  userId: z.string().uuid().nonempty("User ID is required"),
});

export function tokenSchema(type: TokenType) {
  return baseTokenSchema.extend({
    type: z.literal(type),
  });
}

export function verificationTokenSchema(authType: TokenAuthType) {
  return baseTokenSchema.extend({
    authType: z.literal(authType),
    bvn: authType === TokenAuthType.BVN ? z.string().nonempty() : z.string().optional(),
    email: z.string().email({ message: "Invalid email format" }).nonempty("Email is required"),
    type: z.literal(TokenType.VERIFICATION),
  });
}

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(32, { message: "Password must be no more than 32 characters long" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[!@#$%^&*(),.?":{}|<>~`[\]\-=+_]/, {
    message: "Password must contain at least one special character",
  });

export const idParamSchema = buildStrictSchema<{ id: string }>({
  id: z.string().uuid(),
});

export const accountNumberSchema = z
  .string()
  .nonempty()
  .length(10)
  .regex(/^\d+$/, { message: "Account number must contain only digits" });

export const transactionPinSchema = z
  .string()
  .nonempty()
  .length(4)
  .regex(/^\d+$/, { message: "Pin must contain only digits" });

export const amountSchema = z.number({ coerce: true }).positive().safe().finite();

export const paginationSchema = z.object({
  limit: z.number({ coerce: true }).min(1).max(100).positive().default(10),
  page: z.number({ coerce: true }).min(1).positive().safe().finite().default(1),
});
