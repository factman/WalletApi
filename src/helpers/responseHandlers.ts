import { Response } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

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
  const error = errorData instanceof Error ? undefined : errorData;

  return res.status(statusCode).json({
    error,
    message: errorMessage,
    status: "error",
  });
}

export function successResponse(
  res: Response,
  data: unknown,
  message: string,
  statusCode?: StatusCodes,
): Response;
export function successResponse(
  res: Response,
  data: unknown,
  message: string,
  statusCode: StatusCodes = StatusCodes.OK,
): Response {
  return res.status(statusCode).json({
    data,
    message,
    status: "success",
  });
}
