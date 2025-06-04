import { StatusCodes } from "http-status-codes";
import { describe, expect, it } from "vitest";

import { CustomError } from "../errorInstance";

describe("CustomError", () => {
  it("should create an error with the provided message", () => {
    const err = new CustomError("Something went wrong");
    expect(err.message).toBe("Something went wrong");
  });

  it("should set the default status to BAD_REQUEST", () => {
    const err = new CustomError("Default status");
    expect(err.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it("should set the status to the provided value", () => {
    const err = new CustomError("Not found", StatusCodes.NOT_FOUND);
    expect(err.status).toBe(StatusCodes.NOT_FOUND);
  });

  it("should set the name to the provided value", () => {
    const err = new CustomError("Custom name", StatusCodes.BAD_REQUEST, "MyError");
    expect(err.name).toBe("MyError");
  });

  it("should set the name to 'CustomError' by default", () => {
    const err = new CustomError("Default name");
    expect(err.name).toBe("CustomError");
  });

  it("should be instance of Error and CustomError", () => {
    const err = new CustomError("Instance check");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(CustomError);
  });

  it("should have a stack trace", () => {
    const err = new CustomError("Stack trace");
    expect(typeof err.stack).toBe("string");
    expect(err.stack).toContain("CustomError");
  });
});
