import { TokenPayload, VerificationTokenPayload } from "@/helpers/types";
import SessionModel from "@/models/SessionModel";
import UserModel from "@/models/UserModel";

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
