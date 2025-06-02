export {};

declare global {
  namespace Express {
    export interface Request {
      accessTokenPayload?: Record<string, unknown>;
      refreshTokenPayload?: Record<string, unknown>;
      verificationTokenPayload?: Record<string, unknown>;
    }
  }
}
