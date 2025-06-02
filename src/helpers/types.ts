import { IncomingHttpHeaders } from "node:http";
import { ZodObject, ZodRawShape, ZodTypeAny } from "zod";

export type HeaderSchemaType = Record<keyof IncomingHttpHeaders, ZodTypeAny> & ZodRawShape;

export type SchemaType = ZodObject<ZodRawShape, "passthrough"> | ZodObject<ZodRawShape, "strict">;

export interface ValidationError {
  entity: string;
  message: string;
  path: string;
}
