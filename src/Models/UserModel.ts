export enum UserStatus {
  BLACKLISTED = "blacklisted",
  DELETED = "deleted",
  SUSPENDED = "suspended",
  UNVERIFIED = "unverified",
  VERIFIED = "verified",
}

export default interface UserModel {
  createdAt: string;
  deletedAt: null | string;
  email: string;
  id: string;
  isBlacklisted: boolean;
  isEmailVerified: boolean;
  isKycVerified: boolean;
  isPasswordResetRequired: boolean;
  isTwoFactorEnabled: boolean;
  lastLogin: null | string;
  password: string;
  phone: string;
  status: UserStatus;
  timezone: string;
  updatedAt: string;
}
