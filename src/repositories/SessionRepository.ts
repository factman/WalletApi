import Knex from "knex";

import database from "../configs/database";
import { SCHEMA_TABLES } from "../helpers/constants";
import SessionModel from "../models/SessionModel";
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
    await this.table
      .transacting(trx)
      .insert({ ...sessionData, createdAt: this.knex.fn.now(), updatedAt: this.knex.fn.now() });
    return await this.table.where("id", sessionData.id).transacting(trx).first();
  }

  async deleteSession(trx: Knex.Knex.Transaction, userId: SessionModel["userId"]) {
    await this.table.where({ userId }).del().transacting(trx);
  }

  async getActiveSession(session: Pick<SessionModel, "deviceId" | "id" | "userId">) {
    return await this.table
      .select()
      .where({ ...session })
      .where("accessTokenExpiresAt", ">", this.knex.fn.now())
      .where("expiresAt", ">", this.knex.fn.now())
      .first();
  }

  async getSessionById(id: SessionModel["id"]) {
    return await this.table.select().where({ id }).first();
  }

  async updateSession(
    trx: Knex.Knex.Transaction,
    id: SessionModel["id"],
    sessionData: Partial<Omit<SessionModel, "createdAt" | "id" | "updatedAt" | "userId">>,
  ) {
    await this.table
      .update({ ...sessionData, updatedAt: this.knex.fn.now() })
      .where({ id })
      .transacting(trx);

    return await this.table.where({ id }).transacting(trx).first();
  }
}
