import { Response } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

import { CustomError } from "./errorInstance";

export function errorResponse(
  res: Response,
  statusCode?: StatusCodes,
  errorData?: unknown,
  message?: string,
): Response;
export function errorResponse(
  res: Response,
  statusCode: StatusCodes = StatusCodes.BAD_REQUEST,
  errorData?: unknown,
  message?: string,
): Response {
  const errorMessage =
    !message && errorData instanceof Error
      ? errorData.message
      : (message ?? getReasonPhrase(statusCode));
  let error = errorData instanceof CustomError ? (errorData.payload as unknown) : errorData;
  error = error instanceof Error ? undefined : error;

  return res.status(statusCode).json({
    error,
    message: errorMessage,
    status: "error",
  });
}

export function successResponse<T>(
  res: Response,
  data: T,
  message: string,
  statusCode?: StatusCodes,
): Response;
export function successResponse<T>(
  res: Response,
  data: T,
  message: string,
  statusCode: StatusCodes = StatusCodes.OK,
): Response {
  return res.status(statusCode).json({
    data,
    message,
    status: "success",
  });
}
