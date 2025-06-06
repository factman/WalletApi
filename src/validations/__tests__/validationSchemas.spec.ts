import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import { TokenAuthType, TokenType } from "../../helpers/types.js";
import { authorizationSchema, tokenSchema, verificationTokenSchema } from "../validationSchemas.js";

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

describe("tokenSchema", () => {
  const validBase = {
    deviceId: "device-123",
    exp: Date.now(),
    ipAddress: "192.168.1.1",
    sessionId: "550e8400-e29b-41d4-a716-446655440000",
    userAgent: "Mozilla/5.0",
    userId: "550e8400-e29b-41d4-a716-446655440001",
  };

  it("should pass with valid token data", () => {
    const schema = tokenSchema(TokenType.ACCESS);
    const result = schema.safeParse({
      ...validBase,
      type: TokenType.ACCESS,
    });
    expect(result.success).toBe(true);
  });

  it("should fail if type does not match", () => {
    const schema = tokenSchema(TokenType.REFRESH);
    const result = schema.safeParse({
      ...validBase,
      type: TokenType.ACCESS,
    });
    expect(result.success).toBe(false);
  });

  it("should fail if required fields are missing", () => {
    const schema = tokenSchema(TokenType.ACCESS);
    const result = schema.safeParse({
      type: TokenType.ACCESS,
    });
    expect(result.success).toBe(false);
  });

  it("should fail if ipAddress is not valid", () => {
    const schema = tokenSchema(TokenType.ACCESS);
    const result = schema.safeParse({
      ...validBase,
      ipAddress: "not-an-ip",
      type: TokenType.ACCESS,
    });
    expect(result.success).toBe(false);
  });

  it("should fail if sessionId is not a uuid", () => {
    const schema = tokenSchema(TokenType.ACCESS);
    const result = schema.safeParse({
      ...validBase,
      sessionId: "not-a-uuid",
      type: TokenType.ACCESS,
    });
    expect(result.success).toBe(false);
  });
});

describe("verificationTokenSchema", () => {
  const validBase = {
    deviceId: "device-123",
    email: "test@example.com",
    exp: DateTime.now().plus({ hour: 6 }).toUnixInteger(),
    ipAddress: "127.0.0.1",
    sessionId: "550e8400-e29b-41d4-a716-446655440000",
    type: TokenType.VERIFICATION,
    userAgent: "Mozilla/5.0",
    userId: "550e8400-e29b-41d4-a716-446655440001",
  };

  it("should pass with valid BVN data", () => {
    const schema = verificationTokenSchema(TokenAuthType.BVN);
    const result = schema.safeParse({
      ...validBase,
      authType: TokenAuthType.BVN,
      bvn: "12345678901",
    });
    expect(result.success).toBe(true);
  });

  it("should pass with valid data for EMAIL authType", () => {
    const schema = verificationTokenSchema(TokenAuthType.EMAIL);
    const result = schema.safeParse({
      ...validBase,
      authType: TokenAuthType.EMAIL,
    });
    expect(result.success).toBe(true);
  });

  it("should fail if email is invalid", () => {
    const schema = verificationTokenSchema(TokenAuthType.EMAIL);
    const result = schema.safeParse({
      ...validBase,
      authType: TokenAuthType.EMAIL,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("should fail if type is not VERIFICATION", () => {
    const schema = verificationTokenSchema(TokenAuthType.EMAIL);
    const result = schema.safeParse({
      ...validBase,
      authType: TokenAuthType.EMAIL,
      type: TokenType.ACCESS,
    });
    expect(result.success).toBe(false);
  });
});
