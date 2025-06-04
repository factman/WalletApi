import database from "@/configs/database";
import { SCHEMA_VIEWS } from "@/helpers/constants";
import AuthenticatedUserModel from "@/models/AuthenticatedUserModel";

export class AuthenticatedUserRepository {
  private db: typeof database;

  constructor(databaseInstance = database) {
    this.db = databaseInstance;
  }

  async getUserBySessionId(sessionId: AuthenticatedUserModel["userId"]) {
    return await this.db(SCHEMA_VIEWS.AUTHENTICATED_USERS)
      .select<
        Omit<AuthenticatedUserModel, "sessionExpiresAt" | "sessionId">
      >("deviceId", "email", "ipAddress", "isBlacklisted", "isEmailVerified", "isKycVerified", "isPasswordResetRequired", "isTwoFactorEnabled", "lastLogin", "phone")
      .where({ sessionId })
      .first();
  }
}
