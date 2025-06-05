import type { Response } from "express";

import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { errorResponse, successResponse } from "../responseHandlers";

function createResponseMock() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockImplementation(function (this: Response, code: number) {
    this.statusCode = code;
    return this;
  });
  res.json = vi.fn().mockImplementation(function (
    this: Response & { body: unknown },
    data: unknown,
  ) {
    this.body = data;
    return this;
  });
  return res as Response & { body?: unknown; statusCode?: number };
}

describe("responseHandlers", () => {
  let res: ReturnType<typeof createResponseMock>;

  beforeEach(() => {
    res = createResponseMock();
    vi.clearAllMocks();
  });

  describe("errorResponse", () => {
    it("should return BAD_REQUEST by default", () => {
      errorResponse(res);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        error: undefined,
        message: getReasonPhrase(StatusCodes.BAD_REQUEST),
        status: "error",
      });
    });

    it("should use provided status code", () => {
      errorResponse(res, StatusCodes.NOT_FOUND);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        error: undefined,
        message: getReasonPhrase(StatusCodes.NOT_FOUND),
        status: "error",
      });
    });

    it("should use provided error data", () => {
      const errorData = { foo: "bar" };
      errorResponse(res, StatusCodes.UNAUTHORIZED, errorData);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        error: errorData,
        message: getReasonPhrase(StatusCodes.UNAUTHORIZED),
        status: "error",
      });
    });

    it("should use provided message", () => {
      const errorData = { foo: "bar" };
      const message = "Custom error message";
      errorResponse(res, StatusCodes.FORBIDDEN, errorData, message);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({
        error: errorData,
        message,
        status: "error",
      });
    });

    it("should use errorData.message if errorData is an Error and message is not provided", () => {
      const error = new Error("Something went wrong");
      errorResponse(res, StatusCodes.BAD_REQUEST, error);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        error: undefined,
        message: error.message,
        status: "error",
      });
    });
  });

  describe("successResponse", () => {
    it("should return OK by default", () => {
      const data = { foo: "bar" };
      const message = "Success!";
      successResponse(res, data, message);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        data,
        message,
        status: "success",
      });
    });

    it("should use provided status code", () => {
      const data = [1, 2, 3];
      const message = "Created!";
      successResponse(res, data, message, StatusCodes.CREATED);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        data,
        message,
        status: "success",
      });
    });
  });
});
