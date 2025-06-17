/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { errorResponse } from "../../../helpers/responseHandlers.js";
import { TokenAuthType } from "../../../helpers/types.js";
import { SessionRepository } from "../../../repositories/SessionRepository.js";
import * as utilities from "../helpers/utilities.js";
import { validateOtpVerification } from "../middlewares.js";

vi.mock("../../../repositories/SessionRepository");
vi.mock("../../../configs/database.js", () => ({
  default: {
    transaction: vi.fn().mockResolvedValue({
      rollback: vi.fn(),
    }),
  },
}));
vi.mock("../../../helpers/responseHandlers", () => ({
  errorResponse: vi.fn(),
}));

describe("validateOtpVerification", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let sessionRepositoryMock: any;
  const errorResponseMock = errorResponse;

  beforeEach(() => {
    req = { body: {} };
    res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    next = vi.fn();
    sessionRepositoryMock = {
      deleteSession: vi.fn(),
      getSessionById: vi.fn(),
    };
    (SessionRepository as any).mockImplementation(() => sessionRepositoryMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call next() and attach payloads on valid token and session", async () => {
    const tokenPayload = { sessionId: "sess1" };
    req.body = { verificationToken: "valid-token" };
    vi.spyOn(utilities, "validateVerificationToken").mockReturnValue({
      error: null,
      tokenPayload,
    } as any);
    sessionRepositoryMock.getSessionById.mockResolvedValue({ userId: "user1" });

    const middleware = validateOtpVerification(TokenAuthType.EMAIL);
    await middleware(req as Request, res as Response, next);

    expect(utilities.validateVerificationToken).toHaveBeenCalledWith(
      "valid-token",
      TokenAuthType.EMAIL,
    );
    expect(sessionRepositoryMock.getSessionById).toHaveBeenCalledWith("sess1");
    expect(req.verificationTokenPayload).toEqual(tokenPayload);
    expect(req.sessionPayload).toEqual({ userId: "user1" });
    expect(next).toHaveBeenCalled();
  });

  it("should handle invalid token and respond with error", async () => {
    vi.spyOn(utilities, "validateVerificationToken").mockReturnValue({
      error: "bad token",
      tokenPayload: null,
    } as any);

    const middleware = validateOtpVerification(TokenAuthType.EMAIL);
    await middleware(req as Request, res as Response, next);

    expect(errorResponseMock).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle missing session and respond with error", async () => {
    const tokenPayload = { sessionId: "sess2" };
    req.body = { verificationToken: "valid-token" };
    vi.spyOn(utilities, "validateVerificationToken").mockReturnValue({
      error: null,
      tokenPayload,
    } as any);
    sessionRepositoryMock.getSessionById.mockResolvedValue(undefined);

    const middleware = validateOtpVerification(TokenAuthType.EMAIL);
    await middleware(req as Request, res as Response, next);

    expect(errorResponseMock).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("should delete session and rollback on error if session exists", async () => {
    const tokenPayload = { sessionId: "sess3" };
    req.body = { verificationToken: "valid-token" };
    vi.spyOn(utilities, "validateVerificationToken").mockReturnValue({
      error: null,
      tokenPayload,
    } as any);
    sessionRepositoryMock.getSessionById.mockResolvedValue({ userId: "user3" });

    // Simulate error in next()
    sessionRepositoryMock.deleteSession.mockImplementation(() => Promise.reject(new Error("fail")));

    // Force error in next() by making next throw
    const middleware = validateOtpVerification(TokenAuthType.EMAIL);
    // Patch next to throw
    const errorThrowingNext = () => {
      throw new Error("next error");
    };

    await middleware(req as Request, res as Response, errorThrowingNext as any);

    expect(sessionRepositoryMock.deleteSession).toHaveBeenCalled();
    expect(errorResponseMock).toHaveBeenCalled();
  });

  it("should log error and respond with error if exception is thrown", async () => {
    vi.spyOn(utilities, "validateVerificationToken").mockImplementation(() => {
      throw new Error("unexpected");
    });

    const middleware = validateOtpVerification(TokenAuthType.EMAIL);
    await middleware(req as Request, res as Response, next);

    expect(errorResponseMock).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
