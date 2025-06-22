import { describe, expect, it } from "vitest";

import {
  forgotPasswordRequestSchema,
  initiateAuthenticationRequestSchema,
  initiateBvnVerificationRequestSchema,
  loginRequestSchema,
  logoutRequestSchema,
  refreshTokenRequestSchema,
  resendEmailVerificationRequestSchema,
  resetPasswordRequestSchema,
  signupRequestSchema,
  verifyBvnRequestSchema,
  verifyEmailRequestSchema,
  verifyForgotPasswordRequestSchema,
} from "../validationSchemas";

// Mock passwordSchema expects at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const validPassword = "Password1!";
// Mock JWT
const validJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

describe("forgotPasswordRequestSchema", () => {
  it("validates correct input", () => {
    expect(() =>
      forgotPasswordRequestSchema.parse({ deviceId: "abc", email: "a@b.com" }),
    ).not.toThrow();
  });

  it("rejects missing email", () => {
    expect(() => forgotPasswordRequestSchema.parse({ deviceId: "abc" })).toThrow();
  });
});

describe("initiateAuthenticationRequestSchema", () => {
  it("validates correct input", () => {
    expect(() =>
      initiateAuthenticationRequestSchema.parse({
        deviceId: "dev1",
        email: "test@example.com",
        password: "abc",
      }),
    ).not.toThrow();
  });

  it("rejects empty password", () => {
    expect(() =>
      initiateAuthenticationRequestSchema.parse({
        deviceId: "dev1",
        email: "test@example.com",
        password: "",
      }),
    ).toThrow();
  });
});

describe("initiateBvnVerificationRequestSchema", () => {
  it("validates correct input", () => {
    expect(() =>
      initiateBvnVerificationRequestSchema.parse({
        bvn: "12345678901",
        dob: "2000-01-01",
        firstName: "John",
        gender: "MALE",
        lastName: "Doe",
      }),
    ).not.toThrow();
  });

  it("rejects invalid BVN", () => {
    expect(() =>
      initiateBvnVerificationRequestSchema.parse({
        bvn: "12345",
        dob: "2000-01-01",
        firstName: "John",
        gender: "MALE",
        lastName: "Doe",
      }),
    ).toThrow();
  });

  it("rejects invalid gender", () => {
    expect(() =>
      initiateBvnVerificationRequestSchema.parse({
        bvn: "12345678901",
        dob: "2000-01-01",
        firstName: "John",
        gender: "OTHER",
        lastName: "Doe",
      }),
    ).toThrow();
  });
});

describe("loginRequestSchema", () => {
  it("validates correct input", () => {
    expect(() =>
      loginRequestSchema.parse({
        deviceId: "dev1",
        otp: "123456",
        verificationToken: validJwt,
      }),
    ).not.toThrow();
  });

  it("rejects invalid OTP", () => {
    expect(() =>
      loginRequestSchema.parse({
        deviceId: "dev1",
        otp: "abc",
        verificationToken: validJwt,
      }),
    ).toThrow();
  });
});

describe("logoutRequestSchema", () => {
  it("validates correct input", () => {
    expect(() =>
      logoutRequestSchema.parse({
        userId: "123e4567-e89b-12d3-a456-426614174000",
      }),
    ).not.toThrow();
  });

  it("rejects invalid UUID", () => {
    expect(() =>
      logoutRequestSchema.parse({
        userId: "not-a-uuid",
      }),
    ).toThrow();
  });
});

describe("refreshTokenRequestSchema", () => {
  it("validates correct input", () => {
    expect(() =>
      refreshTokenRequestSchema.parse({
        deviceId: "dev1",
        refreshToken: validJwt,
        userId: "123e4567-e89b-12d3-a456-426614174000",
      }),
    ).not.toThrow();
  });

  it("rejects missing refreshToken", () => {
    expect(() =>
      refreshTokenRequestSchema.parse({
        deviceId: "dev1",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      }),
    ).toThrow();
  });
});

describe("resendEmailVerificationRequestSchema", () => {
  it("validates correct input", () => {
    expect(() =>
      resendEmailVerificationRequestSchema.parse({
        email: "a@b.com",
      }),
    ).not.toThrow();
  });

  it("rejects invalid email", () => {
    expect(() =>
      resendEmailVerificationRequestSchema.parse({
        email: "not-an-email",
      }),
    ).toThrow();
  });
});

describe("resetPasswordRequestSchema", () => {
  it("validates correct input", () => {
    expect(() =>
      resetPasswordRequestSchema.parse({
        deviceId: "dev1",
        newPassword: validPassword,
        oldPassword: "OldPassword1!",
        verificationToken: validJwt,
      }),
    ).not.toThrow();
  });

  it("rejects weak newPassword", () => {
    expect(() =>
      resetPasswordRequestSchema.parse({
        deviceId: "dev1",
        newPassword: "123",
        oldPassword: "OldPassword1!",
        verificationToken: validJwt,
      }),
    ).toThrow();
  });
});

describe("signupRequestSchema", () => {
  it("validates correct input", () => {
    expect(() =>
      signupRequestSchema.parse({
        deviceId: "dev1",
        email: "a@b.com",
        password: validPassword,
        phone: "01234567890",
        timezone: "Africa/Lagos",
      }),
    ).not.toThrow();
  });

  it("rejects invalid phone", () => {
    expect(() =>
      signupRequestSchema.parse({
        deviceId: "dev1",
        email: "a@b.com",
        password: validPassword,
        phone: "1234567890",
        timezone: "Africa/Lagos",
      }),
    ).toThrow();
  });
});

describe("verifyBvnRequestSchema", () => {
  it("validates correct input", () => {
    expect(() =>
      verifyBvnRequestSchema.parse({
        otp: "123456",
        verificationToken: validJwt,
      }),
    ).not.toThrow();
  });

  it("rejects invalid OTP", () => {
    expect(() =>
      verifyBvnRequestSchema.parse({
        otp: "abc",
        verificationToken: validJwt,
      }),
    ).toThrow();
  });
});

describe("verifyEmailRequestSchema", () => {
  it("validates correct input", () => {
    expect(() =>
      verifyEmailRequestSchema.parse({
        otp: "123456",
        verificationToken: validJwt,
      }),
    ).not.toThrow();
  });
});

describe("verifyForgotPasswordRequestSchema", () => {
  it("validates correct input", () => {
    expect(() =>
      verifyForgotPasswordRequestSchema.parse({
        otp: "123456",
        verificationToken: validJwt,
      }),
    ).not.toThrow();
  });
});
