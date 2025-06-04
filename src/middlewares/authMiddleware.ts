import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import { env } from "@/configs/env";
import { errorResponse } from "@/helpers/responseHandlers";
import { TokenType } from "@/helpers/types";
import { authorizationSchema, tokenSchema } from "@/validations/validationSchemas";

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  const authError = new Error("Access Denied / Unauthorized request");
  const { data, success } = authorizationSchema(authError.message).safeParse(req.headers);

  if (!success) {
    errorResponse(res, StatusCodes.UNAUTHORIZED, authError);
  } else {
    const authorization = data.authorization as string;
    const token = authorization.split(" ")[1];
    if (!token) {
      errorResponse(res, StatusCodes.UNAUTHORIZED, authError);
    } else {
      try {
        const validToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
        const result = tokenSchema(TokenType.ACCESS).safeParse(validToken);

        if (!result.success) {
          errorResponse(res, StatusCodes.UNAUTHORIZED, authError);
        } else {
          req.accessTokenPayload = result.data;
          next();
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        errorResponse(res, StatusCodes.UNAUTHORIZED, authError);
      }
    }
  }
};
