import { IncomingHttpHeaders } from "node:http";
import { z, ZodObject } from "zod";

export enum TokenAuthType {
  BVN = "bvn",
  EMAIL = "email",
  FORGOT_PASSWORD = "forgot-password",
  LOGIN = "login",
}

export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
  VERIFICATION = "verification",
}

export type HeaderSchemaType = Record<keyof IncomingHttpHeaders, z.ZodTypeAny> & z.ZodRawShape;

export interface PaginationMeta {
  currentPage: number;
  recordsPerPage: number;
  totalPages: number;
  totalRecords: number;
}

export type SchemaType =
  | ZodObject<z.ZodRawShape, "passthrough">
  | ZodObject<z.ZodRawShape, "strict">;

export interface TokenPayload {
  deviceId: string;
  exp: number;
  ipAddress: string;
  sessionId: string;
  type: TokenType;
  userAgent: string;
  userId: string;
}

export interface ValidationError {
  entity: string;
  message: string;
  path: string;
}

export interface VerificationTokenPayload extends TokenPayload {
  authType: TokenAuthType;
  bvn?: string;
  email: string;
  type: TokenType.VERIFICATION;
}
