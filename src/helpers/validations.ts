import { z, ZodRawShape } from "zod";
import { HeaderSchemaType } from "./types";

export function buildStrictSchema(schemaObject: ZodRawShape) {
  return z.strictObject(schemaObject);
}

export function buildHeaderSchema(schemaObject: Partial<HeaderSchemaType>) {
  return z.object(schemaObject as HeaderSchemaType).passthrough();
}
