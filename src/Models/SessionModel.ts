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
