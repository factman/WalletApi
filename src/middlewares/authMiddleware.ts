import { env } from "@/configs/env";
import { errorResponse } from "@/helpers/responseHandlers";
import { authorizationSchema } from "@/validations/validationSchemas";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  const authError = new Error("Access Denied / Unauthorized request");
  const { success, error, data } = authorizationSchema(authError.message).safeParse(req.headers);

  if (!success) return errorResponse(res, StatusCodes.UNAUTHORIZED, new Error(error.errors[0].message));

  const authorization = data.authorization as string;
  const token = authorization.split(" ")[1];
  if (!token) return errorResponse(res, StatusCodes.UNAUTHORIZED, authError);

  const validToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JwtPayload;
  if (!validToken) return errorResponse(res, StatusCodes.UNAUTHORIZED, authError);

  req.accessTokenPayload = validToken;
  next();
};
