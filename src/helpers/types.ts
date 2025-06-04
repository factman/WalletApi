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

export type SchemaType =
  | ZodObject<z.ZodRawShape, "passthrough">
  | ZodObject<z.ZodRawShape, "strict">;

export interface ValidationError {
  entity: string;
  message: string;
  path: string;
}
