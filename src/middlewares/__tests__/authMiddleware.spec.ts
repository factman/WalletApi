import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authGuard } from "../authMiddleware";

describe("authGuard middleware", () => {
  let next: NextFunction, req: Request, res: Response;

  beforeEach(() => {
    req = { headers: {} } as Request;
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response;
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("should return 401 if authorization header is missing", () => {
    authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      error: undefined,
      message: "Access Denied / Unauthorized request",
      status: "error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is missing in authorization header", () => {
    req.headers.authorization = "Bearer";
    authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      error: undefined,
      message: "Access Denied / Unauthorized request",
      status: "error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next and set req.accessTokenPayload if token is valid", () => {
    req.headers.authorization = "Bearer validtoken";
    const payload = { userId: "123" };
    vi.spyOn(jwt, "verify").mockReturnValue(payload as never);
    authGuard(req, res, next);
    expect(req.accessTokenPayload).toEqual(payload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
