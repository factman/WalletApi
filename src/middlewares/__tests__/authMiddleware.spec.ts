import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authGuard } from "../authMiddleware";

describe("authGuard middleware", () => {
  let req: any, res: any, next: any;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("should return 401 if authorization header is missing", () => {
    authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access Denied / Unauthorized request",
      error: undefined,
      status: "error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is missing in authorization header", () => {
    req.headers.authorization = "Bearer";
    authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access Denied / Unauthorized request",
      error: undefined,
      status: "error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if jwt.verify returns falsy", () => {
    req.headers.authorization = "Bearer sometoken";
    vi.spyOn(jwt, "verify").mockReturnValue(undefined as any);
    authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access Denied / Unauthorized request",
      error: undefined,
      status: "error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next and set req.accessTokenPayload if token is valid", () => {
    req.headers.authorization = "Bearer validtoken";
    const payload = { userId: "123" };
    vi.spyOn(jwt, "verify").mockReturnValue(payload as any);
    authGuard(req, res, next);
    expect(req.accessTokenPayload).toEqual(payload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
