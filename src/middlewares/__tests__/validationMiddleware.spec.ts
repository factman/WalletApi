import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { unknown } from "zod";

import { SchemaType } from "@/helpers/types";

import { validateRequest } from "../validationMiddleware";

const mockSchema = {
  safeParse: vi.fn(),
};

const getMockReq = (data: unknown, dataPath: "body" | "headers" | "params" | "query") => {
  return {
    body: {},
    [dataPath]: data,
    headers: {},
    params: {},
    query: {},
  } as unknown as Request;
};

const getMockRes = () => {
  const res = { json: unknown, status: unknown };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as unknown as Response;
};

describe("validateRequest middleware", () => {
  let next: ReturnType<typeof vi.fn>;
  let res: ReturnType<typeof getMockRes>;

  beforeEach(() => {
    next = vi.fn();
    res = getMockRes();
    vi.clearAllMocks();
  });

  it("calls next() if validation succeeds", () => {
    mockSchema.safeParse.mockReturnValue({ success: true });
    const req = getMockReq({ foo: "bar" }, "body");
    const middleware = validateRequest(mockSchema as unknown as SchemaType, "body");
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("returns error response if validation fails", () => {
    mockSchema.safeParse.mockReturnValue({
      error: {
        errors: [
          { message: "Invalid value", path: ["foo"] },
          { message: "Missing field", path: ["bar"] },
        ],
      },
      success: false,
    });
    const req = getMockReq({ foo: 123 }, "body");
    const middleware = validateRequest(mockSchema as unknown as SchemaType, "body");
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      error: [
        { entity: "body", message: "Invalid value", path: "foo" },
        { entity: "body", message: "Missing field", path: "bar" },
      ],
      message: "Validation Error",
      status: "error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("validates query params", () => {
    mockSchema.safeParse.mockReturnValue({ success: true });
    const req = getMockReq({ search: "test" }, "query");
    const middleware = validateRequest(mockSchema as unknown as SchemaType, "query");
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("validates params and returns error", () => {
    mockSchema.safeParse.mockReturnValue({
      error: {
        errors: [{ message: "Invalid id", path: ["id"] }],
      },
      success: false,
    });
    const req = getMockReq({ id: "abc" }, "params");
    const middleware = validateRequest(mockSchema as unknown as SchemaType, "params");
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      error: [{ entity: "params", message: "Invalid id", path: "id" }],
      message: "Validation Error",
      status: "error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("handles empty error array gracefully", () => {
    mockSchema.safeParse.mockReturnValue({
      error: { errors: [] },
      success: false,
    });
    const req = getMockReq({}, "headers");
    const middleware = validateRequest(mockSchema as unknown as SchemaType, "headers");
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      error: [],
      message: "Validation Error",
      status: "error",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
