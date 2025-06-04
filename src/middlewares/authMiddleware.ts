/* eslint-disable @typescript-eslint/unbound-method */
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";

import database from "@/configs/database";
import { env } from "@/configs/env";
import { CustomError } from "@/helpers/errorInstance";
import { errorResponse } from "@/helpers/responseHandlers";
import { TokenPayload, TokenType } from "@/helpers/types";
import { UserStatus } from "@/models/UserModel";
import { SessionRepository } from "@/repositories/SessionRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { authorizationSchema, tokenSchema } from "@/validations/validationSchemas";

export async function authGuard(req: Request, res: Response, next: NextFunction) {
  // Auth error
  const authError = new CustomError(
    "Access Denied / Unauthorized request",
    StatusCodes.UNAUTHORIZED,
  );
  // validating authorization header
  const { data, success } = authorizationSchema(authError.message).safeParse(req.headers);

  if (!success) {
    errorResponse(res, authError.status, authError);
  } else {
    const authorization = data.authorization as string;
    const token = authorization.split(" ")[1];
    if (!token) {
      errorResponse(res, authError.status, authError);
    } else {
      try {
        // verify token
        const validToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
        const result = tokenSchema(TokenType.ACCESS).safeParse(validToken);

        if (!result.success) throw authError;

        // retrieve user session
        const sessionRepository = new SessionRepository();
        const session = await sessionRepository.getSessionById(result.data.sessionId);
        if (!session) throw authError;

        // validating refreshToken validity
        const refreshTokenExpireTime = DateTime.fromSQL(session.refreshTokenExpiresAt)
          .diffNow()
          .as("milliseconds");
        if (refreshTokenExpireTime < 0) {
          const trx = await database.transaction();
          await sessionRepository.deleteSession(trx, session.userId).catch(trx.rollback);
          throw authError;
        }

        // validating accessToken validity
        const accessTokenExpireTime = DateTime.fromSQL(session.accessTokenExpiresAt)
          .diffNow()
          .as("milliseconds");
        if (accessTokenExpireTime < 0) throw authError;

        // retrieve and validating user
        const user = await new UserRepository().getUserById(session.userId);
        if (
          !user ||
          [UserStatus.BLACKLISTED, UserStatus.DELETED, UserStatus.SUSPENDED].includes(user.status)
        )
          throw authError;

        req.sessionPayload = session;
        req.userPayload = user;
        req.accessTokenPayload = result.data;
        next();
      } catch (err) {
        const error = CustomError.fromError(
          err as Error,
          StatusCodes.UNAUTHORIZED,
          authError.message,
        );
        console.error("Token verification failed:", error.payload ?? error);
        errorResponse(res, error.status, error);
      }
    }
  }
}
