import Knex from "knex";

import database from "@/configs/database";
import { SCHEMA_TABLES } from "@/helpers/constants";
import SessionModel from "@/models/SessionModel";

import { Repository } from "./Repository";

export class SessionRepository extends Repository<SessionModel> {
  constructor(databaseInstance = database) {
    super(SCHEMA_TABLES.SESSIONS, databaseInstance);
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
    return await this.table.transacting(trx).insert(sessionData, "*").first();
  }

  async deleteSession(trx: Knex.Knex.Transaction, userId: SessionModel["userId"]) {
    return await this.table.transacting(trx).where({ userId }).del("*").first();
  }

  async getSessionById(id: SessionModel["id"]) {
    return await this.table.select().where({ id }).first();
  }

  async updateSession(
    trx: Knex.Knex.Transaction,
    id: SessionModel["id"],
    sessionData: Partial<Omit<SessionModel, "createdAt" | "id" | "updatedAt" | "userId">>,
  ) {
    return this.table
      .transacting(trx)
      .update({ ...sessionData }, "*")
      .where({ id })
      .first();
  }
}
