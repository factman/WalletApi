import database from "../configs/database.js";
import { SCHEMA_VIEWS } from "../helpers/constants.js";
import AuthenticatedUserModel from "../models/AuthenticatedUserModel.js";
import { Repository } from "./Repository.js";

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
