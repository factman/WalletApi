import { StatusCodes } from "http-status-codes";

export class CustomError extends Error {
  status: StatusCodes;

  constructor(
    message: string,
    status: StatusCodes = StatusCodes.BAD_REQUEST,
    name = "CustomError",
  ) {
    super(message);
    this.status = status;
    this.name = name;

    // Ensure the stack trace is captured correctly
    Error.captureStackTrace(this);
  }
}
