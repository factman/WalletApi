import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { describe, expect, it } from "vitest";

import { CustomError } from "../errorInstance.js";

describe("CustomError", () => {
  it("should create an instance with default values", () => {
    const err = new CustomError("Test error");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(CustomError);
    expect(err.message).toBe("Test error");
    expect(err.status).toBe(StatusCodes.BAD_REQUEST);
    expect(err.name).toBe("CustomError");
    expect(err.payload).toBeUndefined();
    expect(err.stack).toBeDefined();
  });

  it("should create an instance with custom values", () => {
    const payload = { foo: "bar" };
    const err = new CustomError("Custom message", StatusCodes.NOT_FOUND, payload, "MyError");
    expect(err.message).toBe("Custom message");
    expect(err.status).toBe(StatusCodes.NOT_FOUND);
    expect(err.name).toBe("MyError");
    expect(err.payload).toEqual(payload);
  });

  it("should set payload to undefined if not provided", () => {
    const err = new CustomError("No payload", StatusCodes.OK);
    expect(err.payload).toBeUndefined();
  });

  it("fromError should return the same CustomError instance", () => {
    const err = new CustomError("Already custom", StatusCodes.FORBIDDEN);
    const result = CustomError.fromError(err, StatusCodes.BAD_REQUEST);
    expect(result).toBe(err);
  });

  it("fromError should wrap a generic Error", () => {
    const orig = new Error("Generic error");
    orig.name = "SomeError";
    const result = CustomError.fromError(orig, StatusCodes.UNAUTHORIZED, "Fallback message");
    expect(result).toBeInstanceOf(CustomError);
    expect(result.message).toBe("Fallback message");
    expect(result.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(result.name).toBe("SomeError");
    expect(result.payload).toBe(orig);
    expect(result.stack).toBe(orig.stack);
  });

  it("fromError should use fallbackMessage if provided", () => {
    const orig = new Error("Original error");
    const result = CustomError.fromError(orig, StatusCodes.NOT_FOUND, "Not found fallback");
    expect(result.message).toBe("Not found fallback");
  });

  it("fromError should use getReasonPhrase if fallbackMessage is not provided", () => {
    const orig = new Error("Original error");
    const status = StatusCodes.NOT_IMPLEMENTED;
    const result = CustomError.fromError(orig, status);
    expect(result.message).toBe(getReasonPhrase(status));
  });
});
