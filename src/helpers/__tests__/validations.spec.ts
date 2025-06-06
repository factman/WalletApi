import { describe, expect, it } from "vitest";
import { z } from "zod";

import { HeaderSchemaType } from "../types.js";
import { buildHeaderSchema, buildStrictSchema } from "../validations.js";

describe("buildStrictSchema", () => {
  it("should create a strict schema that only allows defined properties", () => {
    const schema = buildStrictSchema({
      bar: z.number(),
      foo: z.string(),
    });

    expect(schema.parse({ bar: 42, foo: "hello" })).toEqual({ bar: 42, foo: "hello" });

    // Should fail if extra property is present
    expect(() => schema.parse({ bar: 42, extra: true, foo: "hello" })).toThrow();
    // Should fail if missing property
    expect(() => schema.parse({ foo: "hello" })).toThrow();
  });
});

describe("buildHeaderSchema", () => {
  it("should create a schema that allows extra properties (passthrough)", () => {
    const headerShape: Partial<HeaderSchemaType> = {
      authorization: z.string().optional(),
      "x-api-key": z.string(),
    };
    const schema = buildHeaderSchema(headerShape);

    const input = {
      authorization: "Bearer token",
      extra: "allowed",
      "x-api-key": "abc123",
    };

    const result = schema.parse(input);
    expect(result["x-api-key"]).toBe("abc123");
    expect(result.authorization).toBe("Bearer token");
    expect(result.extra).toBe("allowed");
  });

  it("should fail if required header property is missing", () => {
    const headerShape: Partial<HeaderSchemaType> = {
      "x-api-key": z.string(),
    };
    const schema = buildHeaderSchema(headerShape);

    expect(() => schema.parse({})).toThrow();
  });

  it("should allow optional header properties to be missing", () => {
    const headerShape: Partial<HeaderSchemaType> = {
      authorization: z.string().optional(),
      "x-api-key": z.string(),
    };
    const schema = buildHeaderSchema(headerShape);

    const input = {
      "x-api-key": "abc123",
    };

    expect(schema.parse(input)["x-api-key"]).toBe("abc123");
    expect(schema.parse(input).authorization).toBeUndefined();
  });
});
