import { TokenPayload, VerificationTokenPayload } from "../../src/helpers/types";
import SessionModel from "../../src/models/SessionModel";
import UserModel from "../../src/models/UserModel";

export {};

declare global {
  namespace Express {
    export interface Request {
      accessTokenPayload: TokenPayload;
      refreshTokenPayload: TokenPayload;
      sessionPayload: SessionModel;
      userPayload: UserModel;
      verificationTokenPayload: VerificationTokenPayload;
    }
  }
}
