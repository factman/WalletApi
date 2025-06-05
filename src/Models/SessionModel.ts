export default interface SessionModel {
  accessToken: string;
  accessTokenExpiresAt: string;
  createdAt: string;
  deviceId: string;
  expiresAt: string;
  id: string;
  ipAddress: string;
  isTwoFactorVerified: boolean;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  twoFactorCode: null | string;
  twoFactorCodeExpiresAt: null | string;
  twoFactorVerifiedAt: null | string;
  updatedAt: string;
  userAgent: string;
  userId: string;
}
