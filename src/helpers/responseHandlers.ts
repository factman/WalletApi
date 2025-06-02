import { Response } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

export function errorResponse(res: Response): Response;
export function errorResponse(res: Response, statusCode: StatusCodes): Response;
export function errorResponse<T>(res: Response, statusCode: StatusCodes, errorData: T): Response;
export function errorResponse<T>(res: Response, statusCode: StatusCodes, errorData: T, message: string): Response;
export function errorResponse<T>(res: Response, statusCode: StatusCodes = StatusCodes.BAD_REQUEST, errorData?: T, message?: string): Response {
  const errorMessage = !message && errorData instanceof Error ? errorData.message : message || getReasonPhrase(statusCode);
  const error = errorData instanceof Error ? undefined : errorData;

  return res.status(statusCode).json({
    error,
    message: errorMessage,
    status: "error",
  });
}

export function successResponse<T>(res: Response, data: T, message: string): Response;
export function successResponse<T>(res: Response, data: T, message: string, statusCode: StatusCodes): Response;
export function successResponse<T>(res: Response, data: T, message: string, statusCode: StatusCodes = StatusCodes.OK): Response {
  return res.status(statusCode).json({
    data,
    message,
    status: "success",
  });
}
