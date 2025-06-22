import { z } from "zod";

import { HeaderSchemaType } from "./types";

export function buildHeaderSchema(schemaObject: HeaderSchemaType) {
  return z.object(schemaObject).passthrough();
}

export function buildStrictSchema<T, D extends z.ZodRawShape = Record<keyof T, z.ZodTypeAny>>(
  schemaObject: D,
) {
  return z.strictObject(schemaObject) as z.ZodObject<D, "strict", z.ZodTypeAny, T, T>;
}
