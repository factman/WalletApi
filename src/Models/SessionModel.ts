export default interface SessionModel {
  accessToken: string;
  accessTokenExpiresAt: Date;
  createdAt: Date;
  deviceId: string;
  expiresAt: Date;
  id: string;
  ipAddress: string;
  isTwoFactorVerified: boolean;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  twoFactorCode: null | string;
  twoFactorCodeExpiresAt: Date | null;
  twoFactorVerifiedAt: Date | null;
  updatedAt: Date;
  userAgent: string;
  userId: string;
}
