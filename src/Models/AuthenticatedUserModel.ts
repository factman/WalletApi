import SessionModel from "./SessionModel";
import UserModel from "./UserModel";

export enum AuthenticatedUserViewColumns {
  DEVICE_ID = "deviceId",
  EMAIL = "email",
  IP_ADDRESS = "ipAddress",
  IS_BLACKLISTED = "isBlacklisted",
  IS_EMAIL_VERIFIED = "isEmailVerified",
  IS_KYC_VERIFIED = "isKycVerified",
  IS_PASSWORD_RESET_REQUIRED = "isPasswordResetRequired",
  IS_TWO_FACTOR_ENABLED = "isTwoFactorEnabled",
  LAST_LOGIN = "lastLogin",
  PHONE = "phone",
  SESSION_EXPIRES_AT = "sessionExpiresAt",
  SESSION_ID = "sessionId",
  STATUS = "status",
  TIMEZONE = "timezone",
  USER_AGENT = "userAgent",
  USER_ID = "userId",
}

export default interface AuthenticatedUserModel {
  deviceId: SessionModel["deviceId"];
  email: UserModel["email"];
  ipAddress: SessionModel["ipAddress"];
  isBlacklisted: UserModel["isBlacklisted"];
  isEmailVerified: UserModel["isEmailVerified"];
  isKycVerified: UserModel["isKycVerified"];
  isPasswordResetRequired: UserModel["isPasswordResetRequired"];
  isTwoFactorEnabled: UserModel["isTwoFactorEnabled"];
  lastLogin: UserModel["lastLogin"];
  phone: UserModel["phone"];
  sessionExpiresAt: SessionModel["expiresAt"];
  sessionId: SessionModel["id"];
  status: UserModel["status"];
  timezone: UserModel["timezone"];
  userAgent: SessionModel["userAgent"];
  userId: UserModel["id"];
}
