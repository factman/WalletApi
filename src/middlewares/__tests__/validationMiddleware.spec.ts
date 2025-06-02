import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { validateRequest } from "../validationMiddleware";

const mockSchema = {
  safeParse: vi.fn(),
};

const getMockReq = (data: any, dataPath: "query" | "body" | "params" | "headers") => {
  return {
    query: {},
    body: {},
    params: {},
    headers: {},
    [dataPath]: data,
  };
};

const getMockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
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
    const middleware = validateRequest(mockSchema as any, "body");
    middleware(req as any, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("returns error response if validation fails", () => {
    mockSchema.safeParse.mockReturnValue({
      success: false,
      error: {
        errors: [
          { message: "Invalid value", path: ["foo"] },
          { message: "Missing field", path: ["bar"] },
        ],
      },
    });
    const req = getMockReq({ foo: 123 }, "body");
    const middleware = validateRequest(mockSchema as any, "body");
    middleware(req as any, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      error: [
        { message: "Invalid value", path: "foo", entity: "body" },
        { message: "Missing field", path: "bar", entity: "body" },
      ],
      message: "Validation Error",
      status: "error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("validates query params", () => {
    mockSchema.safeParse.mockReturnValue({ success: true });
    const req = getMockReq({ search: "test" }, "query");
    const middleware = validateRequest(mockSchema as any, "query");
    middleware(req as any, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("validates params and returns error", () => {
    mockSchema.safeParse.mockReturnValue({
      success: false,
      error: {
        errors: [{ message: "Invalid id", path: ["id"] }],
      },
    });
    const req = getMockReq({ id: "abc" }, "params");
    const middleware = validateRequest(mockSchema as any, "params");
    middleware(req as any, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      error: [{ message: "Invalid id", path: "id", entity: "params" }],
      message: "Validation Error",
      status: "error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("handles empty error array gracefully", () => {
    mockSchema.safeParse.mockReturnValue({
      success: false,
      error: { errors: [] },
    });
    const req = getMockReq({}, "headers");
    const middleware = validateRequest(mockSchema as any, "headers");
    middleware(req as any, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      error: [],
      message: "Validation Error",
      status: "error",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
