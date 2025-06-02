import { IncomingHttpHeaders } from "node:http";
import { ZodObject, ZodRawShape, ZodTypeAny } from "zod";

export type HeaderSchemaType = ZodRawShape & Record<keyof IncomingHttpHeaders, ZodTypeAny>;

export type SchemaType = ZodObject<ZodRawShape, "strict"> | ZodObject<ZodRawShape, "passthrough">;

export interface ValidationError {
  message: string;
  path: string;
  entity: string;
}
