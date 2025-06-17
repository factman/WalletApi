/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";

import { changePasswordRequestSchema } from "../validationSchemas.js";

describe("changePasswordRequestSchema", () => {
  it("should validate a correct payload", () => {
    const validData = {
      deviceId: "device123",
      newPassword: "StrongPassw0rd!",
      oldPassword: "OldPassw0rd!",
    };
    const result = changePasswordRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail if deviceId is empty", () => {
    const invalidData = {
      deviceId: "",
      newPassword: "StrongPassw0rd!",
      oldPassword: "OldPassw0rd!",
    };
    const result = changePasswordRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("deviceId");
    }
  });

  it("should fail if oldPassword is empty", () => {
    const invalidData = {
      deviceId: "device123",
      newPassword: "StrongPassw0rd!",
      oldPassword: "",
    };
    const result = changePasswordRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("oldPassword");
    }
  });

  it("should fail if newPassword does not meet passwordSchema requirements", () => {
    const invalidData = {
      deviceId: "device123",
      newPassword: "short",
      oldPassword: "OldPassw0rd!",
    };
    const result = changePasswordRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("newPassword");
    }
  });

  it("should fail if extra fields are present", () => {
    const invalidData = {
      deviceId: "device123",
      extra: "not allowed",
      newPassword: "StrongPassw0rd!",
      oldPassword: "OldPassw0rd!",
    };
    const result = changePasswordRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should fail if a required field is missing", () => {
    const invalidData = {
      deviceId: "device123",
      newPassword: "StrongPassw0rd!",
      // oldPassword missing
    } as any;
    const result = changePasswordRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("oldPassword");
    }
  });
});
