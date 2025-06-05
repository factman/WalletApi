/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";
import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TokenPayload, TokenType } from "@/helpers/types";
import { UserStatus } from "@/models/UserModel";
import { SessionRepository } from "@/repositories/SessionRepository";
import { UserRepository } from "@/repositories/UserRepository";

import { authGuard } from "../authMiddleware";

// Mocks
vi.mock("@/repositories/SessionRepository");
vi.mock("@/repositories/UserRepository");
vi.mock("@/configs/database", () => ({
  default: { transaction: vi.fn() },
}));

const mockReq = (headers: Record<string, string> = {}) =>
  ({
    headers,
  }) as unknown as Request;

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn().mockReturnThis();
  return res as Response;
};

const mockNext: NextFunction = vi.fn();

describe("authGuard middleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = mockReq();
    res = mockRes();
    next = mockNext;
    vi.clearAllMocks();
  });

  it("should return 401 if authorization header is missing", async () => {
    req = mockReq({});
    await authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is missing in authorization header", async () => {
    req = mockReq({ authorization: "Bearer" });
    await authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if jwt.verify throws", async () => {
    req = mockReq({ authorization: "Bearer invalidtoken" });
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("Invalid token");
    });
    await authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if tokenSchema fails", async () => {
    req = mockReq({ authorization: "Bearer validtoken" });
    vi.spyOn(jwt, "verify").mockReturnValue({ sessionId: "sid" } as never);
    // Patch tokenSchema to fail
    const { tokenSchema } = await import("@/validations/validationSchemas");
    vi.spyOn(tokenSchema(TokenType.ACCESS), "safeParse").mockReturnValue({
      success: false,
    } as never);
    await authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if session is not found", async () => {
    req = mockReq({ authorization: "Bearer validtoken" });
    vi.spyOn(jwt, "verify").mockReturnValue({ sessionId: "sid" } as never);
    (
      SessionRepository as unknown as { prototype: Record<string, unknown> }
    ).prototype.getSessionById = vi.fn().mockResolvedValue(null);
    await authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 and delete session if refresh token expired", async () => {
    req = mockReq({ authorization: "Bearer validtoken" });
    vi.spyOn(jwt, "verify").mockReturnValue({ sessionId: "sid" } as never);
    const now = DateTime.now().minus({ days: 1 }).toSQL({ includeOffset: false });
    (
      SessionRepository as unknown as { prototype: Record<string, unknown> }
    ).prototype.getSessionById = vi.fn().mockResolvedValue({
      accessTokenExpiresAt: DateTime.now().plus({ days: 1 }).toSQL(),
      refreshTokenExpiresAt: now,
      userId: "uid",
    });
    const trx = { rollback: vi.fn() };
    const db = (await import("@/configs/database")).default;
    (db.transaction as any).mockResolvedValue(trx);
    (
      SessionRepository as unknown as { prototype: Record<string, unknown> }
    ).prototype.deleteSession = vi.fn().mockResolvedValue(undefined);
    await authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if access token expired", async () => {
    req = mockReq({ authorization: "Bearer validtoken" });
    vi.spyOn(jwt, "verify").mockReturnValue({ sessionId: "sid" } as never);
    (SessionRepository as unknown as { prototype: any }).prototype.getSessionById = vi
      .fn()
      .mockResolvedValue({
        accessTokenExpiresAt: DateTime.now().minus({ days: 1 }).toSQL(),
        refreshTokenExpiresAt: DateTime.now().plus({ days: 1 }).toSQL(),
        userId: "uid",
      });
    await authGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next and set req.sessionPayload and req.accessTokenPayload if valid", async () => {
    req = mockReq({ authorization: "Bearer validtoken" });
    const session = {
      accessTokenExpiresAt: DateTime.now().plus({ days: 1 }).toSQL(),
      refreshTokenExpiresAt: DateTime.now().plus({ days: 1 }).toSQL(),
      userId: "uid",
    };
    const tokenPayload: TokenPayload = {
      deviceId: "device-123",
      exp: DateTime.now().plus({ hours: 6 }).toUnixInteger(),
      ipAddress: "127.0.0.1",
      sessionId: randomUUID(),
      type: TokenType.ACCESS,
      userAgent: "agent 47",
      userId: randomUUID(),
    };
    const userData = {
      status: UserStatus.VERIFIED,
    };
    vi.spyOn(jwt, "verify").mockReturnValue(tokenPayload as never);
    (SessionRepository as unknown as { prototype: any }).prototype.getSessionById = vi
      .fn()
      .mockResolvedValue(session);
    (UserRepository as unknown as { prototype: any }).prototype.getUserById = vi
      .fn()
      .mockResolvedValue(userData);
    // Patch tokenSchema to succeed
    const { tokenSchema } = await import("@/validations/validationSchemas");
    vi.spyOn(tokenSchema(TokenType.ACCESS), "safeParse").mockReturnValue({
      data: tokenPayload,
      success: true,
    });
    await authGuard(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.sessionPayload).toEqual(session);
    expect(req.accessTokenPayload).toEqual(tokenPayload);
  });
});
