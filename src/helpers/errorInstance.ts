import { getReasonPhrase, StatusCodes } from "http-status-codes";

export class CustomError<T = undefined> extends Error {
  payload: T | undefined;
  status: StatusCodes;

  constructor(
    message: string,
    status: StatusCodes = StatusCodes.BAD_REQUEST,
    payload?: T,
    name = "CustomError",
  ) {
    super(message);
    this.status = status;
    this.name = name;
    this.payload = payload ?? undefined;

    // Ensure the stack trace is captured correctly
    Error.captureStackTrace(this);
  }

  static fromError(
    error: CustomError | Error,
    fallbackStatus: StatusCodes,
    fallbackMessage?: string,
  ) {
    if ("status" in error) {
      return error;
    }
    const newError = new CustomError(
      fallbackMessage ?? getReasonPhrase(fallbackStatus),
      fallbackStatus,
      error,
      error.name,
    );
    newError.stack = error.stack;

    return newError;
  }
}
