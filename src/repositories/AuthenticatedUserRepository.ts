import database from "@/configs/database";
import { SCHEMA_VIEWS } from "@/helpers/constants";
import AuthenticatedUserModel from "@/models/AuthenticatedUserModel";

import { Repository } from "./Repository";

export class AuthenticatedUserRepository extends Repository<AuthenticatedUserModel> {
  constructor(databaseInstance = database) {
    super(SCHEMA_VIEWS.AUTHENTICATED_USERS, databaseInstance);
  }

  async getUserBySessionId(sessionId: AuthenticatedUserModel["userId"]) {
    return await this.table
      .select<
        Omit<AuthenticatedUserModel, "sessionExpiresAt" | "sessionId">
      >("deviceId", "email", "ipAddress", "isBlacklisted", "isEmailVerified", "isKycVerified", "isPasswordResetRequired", "isTwoFactorEnabled", "lastLogin", "phone")
      .where({ sessionId })
      .first();
  }
}
