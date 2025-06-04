import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TokenType } from "@/helpers/types";

import { authGuard } from "../authMiddleware";

describe("authGuard middleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  const error = {
    error: undefined,
    message: "Access Denied / Unauthorized request",
    status: "error",
  };

  beforeEach(() => {
    req = { headers: {} } as Request;
    res = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response;
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("should return 401 if authorization header is missing", () => {
    authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(error);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if authorization header is invalid format", () => {
    req.headers = { authorization: "Token abc" };
    authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(error);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is missing after Bearer", () => {
    req.headers = { authorization: "Bearer " };
    authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(error);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if jwt.verify throws", () => {
    req.headers = { authorization: "Bearer invalidtoken" };
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("jwt error");
    });
    authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(error);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token payload is invalid", () => {
    req.headers = { authorization: "Bearer validtoken" };
    vi.spyOn(jwt, "verify").mockReturnValue({ valid: false } as never);
    authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(error);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next and set req.accessTokenPayload if token is valid", () => {
    req.headers = { authorization: "Bearer validtoken" };
    const payload = {
      deviceId: "device-123",
      ipAddress: "127.0.0.1",
      sessionId: randomUUID(),
      type: TokenType.ACCESS,
      userAgent: "agent-123",
      userId: randomUUID(),
    };
    vi.spyOn(jwt, "verify").mockReturnValue(payload as never);
    authGuard(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.accessTokenPayload).toEqual(payload);
  });
});
