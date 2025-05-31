export enum SessionTableColumns {
  ACCESS_TOKEN = "accessToken",
  ACCESS_TOKEN_EXPIRES_AT = "accessTokenExpiresAt",
  CREATED_AT = "createdAt",
  DEVICE_ID = "deviceId",
  EXPIRES_AT = "expiresAt",
  ID = "id",
  IP_ADDRESS = "ipAddress",
  IS_TWO_FACTOR_VERIFIED = "isTwoFactorVerified",
  REFRESH_TOKEN = "refreshToken",
  REFRESH_TOKEN_EXPIRES_AT = "refreshTokenExpiresAt",
  TWO_FACTOR_CODE = "twoFactorCode",
  TWO_FACTOR_CODE_EXPIRES_AT = "twoFactorCodeExpiresAt",
  TWO_FACTOR_VERIFIED_AT = "twoFactorVerifiedAt",
  UPDATED_AT = "updatedAt",
  USER_AGENT = "userAgent",
  USER_ID = "userId",
}

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
