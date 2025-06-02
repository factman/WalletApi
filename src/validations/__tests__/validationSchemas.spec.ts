import { describe, expect, it } from "vitest";
import { authorizationSchema } from "../validationSchemas";

describe("authorizationSchema", () => {
  const message = "Authorization header is required";
  const schema = authorizationSchema(message);

  it("should pass with a valid Bearer token", () => {
    const result = schema.safeParse({
      authorization: "Bearer sometoken123",
    });
    expect(result.success).toBe(true);
  });

  it("should fail if authorization header is missing", () => {
    const result = schema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(message);
    }
  });

  it("should fail if authorization header is empty", () => {
    const result = schema.safeParse({ authorization: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(message);
    }
  });

  it("should fail if authorization does not start with Bearer", () => {
    const result = schema.safeParse({ authorization: "Token sometoken123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(message);
    }
  });

  it("should fail if authorization is not a string", () => {
    const result = schema.safeParse({ authorization: 12345 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(message);
    }
  });
});
