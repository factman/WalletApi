export {};

enum TokenAuthType {
  BVN = "bvn",
  EMAIL = "email",
  FORGOT_PASSWORD = "forgot-password",
  LOGIN = "login",
}

enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
  VERIFICATION = "verification",
}

declare global {
  interface TokenPayload {
    deviceId: string;
    exp: number;
    ipAddress: string;
    sessionId: string;
    type: TokenType;
    userAgent: string;
    userId: string;
  }

  interface VerificationTokenPayload extends TokenPayload {
    authType: TokenAuthType;
    bvn?: string;
    email: string;
    type: TokenType.VERIFICATION;
  }
  namespace Express {
    export interface Request {
      accessTokenPayload?: TokenPayload;
      refreshTokenPayload?: TokenPayload;
      verificationTokenPayload?: VerificationTokenPayload;
    }
  }
}
