import Knex from "knex";

import database from "@/configs/database";
import { SCHEMA_TABLES } from "@/helpers/constants";
import SessionModel from "@/models/SessionModel";

export class SessionRepository {
  private db: typeof database;

  constructor(databaseInstance = database) {
    this.db = databaseInstance;
  }

  async createSession(
    trx: Knex.Knex.Transaction,
    sessionData: Omit<
      SessionModel,
      | "createdAt"
      | "isTwoFactorVerified"
      | "twoFactorCode"
      | "twoFactorCodeExpiresAt"
      | "twoFactorVerifiedAt"
      | "updatedAt"
    >,
  ) {
    return await trx<SessionModel>(SCHEMA_TABLES.SESSIONS)
      .insert(sessionData)
      .returning("*")
      .first();
  }

  async deleteSession(trx: Knex.Knex.Transaction, userId: SessionModel["userId"]) {
    return await trx<SessionModel>(SCHEMA_TABLES.SESSIONS).where({ userId }).del("*").first();
  }

  async getSessionById(id: string) {
    return await this.db<SessionModel>(SCHEMA_TABLES.SESSIONS).select().where({ id }).first();
  }

  async updateSession(
    trx: Knex.Knex.Transaction,
    id: string,
    sessionData: Partial<Omit<SessionModel, "createdAt" | "id" | "updatedAt" | "userId">>,
  ) {
    return trx<SessionModel>(SCHEMA_TABLES.SESSIONS)
      .update({ ...sessionData, updatedAt: this.db.fn.now() }, "*")
      .where({ id })
      .first();
  }
}
