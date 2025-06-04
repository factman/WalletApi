import { z } from "zod";

import { HeaderSchemaType } from "./types";

export function buildHeaderSchema(schemaObject: Partial<HeaderSchemaType>) {
  return z.object(schemaObject as HeaderSchemaType).passthrough();
}

export function buildStrictSchema<T, D extends z.ZodRawShape = Record<keyof T, z.ZodTypeAny>>(
  schemaObject: D,
) {
  return z.strictObject(schemaObject) as z.ZodObject<D, "strict", z.ZodTypeAny, T, T>;
}
