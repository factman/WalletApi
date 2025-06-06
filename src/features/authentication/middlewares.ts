import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import database from "../../configs/database.js";
import { CustomError } from "../../helpers/errorInstance.js";
import { errorResponse } from "../../helpers/responseHandlers.js";
import { TokenAuthType } from "../../helpers/types.js";
import SessionModel from "../../models/SessionModel.js";
import { SessionRepository } from "../../repositories/SessionRepository.js";
import { validateVerificationToken } from "./helpers/utilities.js";

export function validateOtpVerification(authType: TokenAuthType) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const sessionRepository = new SessionRepository();
    let session: SessionModel | undefined;

    try {
      const { error, tokenPayload } = validateVerificationToken(
        req.body.verificationToken,
        authType,
      );
      if (error || !tokenPayload)
        throw new CustomError("Invalid credentials", StatusCodes.BAD_REQUEST, { message: error });

      // retrieve user session
      session = await sessionRepository.getSessionById(tokenPayload.sessionId);
      if (!session) throw new CustomError("Invalid credentials", StatusCodes.UNAUTHORIZED);

      req.verificationTokenPayload = tokenPayload;
      req.sessionPayload = session;
      next();
    } catch (err) {
      if (session) {
        const trx = await database.transaction();
        await sessionRepository.deleteSession(trx, session.userId).catch(trx.rollback);
      }
      const error = CustomError.fromError(err as Error, StatusCodes.UNAUTHORIZED);
      console.error("Token verification failed:", error.payload ?? error);
      errorResponse(res, error.status, error);
    }
  };
}
