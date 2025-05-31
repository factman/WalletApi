export enum UserTableColumns {
  CREATED_AT = "createdAt",
  DELETED_AT = "deletedAt",
  EMAIL = "email",
  ID = "id",
  IS_BLACKLISTED = "isBlacklisted",
  IS_EMAIL_VERIFIED = "isEmailVerified",
  IS_KYC_VERIFIED = "isKycVerified",
  IS_PASSWORD_RESET_REQUIRED = "isPasswordResetRequired",
  IS_TWO_FACTOR_ENABLED = "isTwoFactorEnabled",
  LAST_LOGIN = "lastLogin",
  PASSWORD = "password",
  PHONE = "phone",
  STATUS = "status",
  TIMEZONE = "timezone",
  UPDATED_AT = "updatedAt",
}

enum UserStatus {
  BLACKLISTED = "blacklisted",
  DELETED = "deleted",
  SUSPENDED = "suspended",
  UNVERIFIED = "unverified",
  VERIFIED = "verified",
}

export default interface UserModel {
  createdAt: Date;
  deletedAt: Date | null;
  email: string;
  id: string;
  isBlacklisted: boolean;
  isEmailVerified: boolean;
  isKycVerified: boolean;
  isPasswordResetRequired: boolean;
  isTwoFactorEnabled: boolean;
  lastLogin: Date | null;
  password: string;
  phone: string;
  status: UserStatus;
  timezone: string;
  updatedAt: Date;
}
