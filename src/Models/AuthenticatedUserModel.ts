import SessionModel from "./SessionModel";
import UserModel from "./UserModel";

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
