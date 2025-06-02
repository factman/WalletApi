export {};

declare global {
  namespace Express {
    export interface Request {
      accessTokenPayload?: Record<string, any>;
      refreshTokenPayload?: Record<string, any>;
    }
  }
}
