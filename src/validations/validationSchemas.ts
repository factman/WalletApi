import { z } from "zod";

import { TokenAuthType, TokenType } from "@/helpers/types";
import { buildHeaderSchema } from "@/helpers/validations";

export function authorizationSchema(message: string) {
  return buildHeaderSchema({
    authorization: z.string({ message }).nonempty(message).startsWith("Bearer", message),
  });
}

const baseTokenSchema = z.object({
  deviceId: z.string().nonempty("Device ID is required"),
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
    bvn: authType === TokenAuthType.BVN ? z.string().length(11) : z.string().optional(),
    email: z.string().email({ message: "Invalid email format" }).nonempty("Email is required"),
    type: z.literal(TokenType.VERIFICATION),
  });
}
