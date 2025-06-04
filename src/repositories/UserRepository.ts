import Knex from "knex";

import database from "@/configs/database";
import { SCHEMA_TABLES } from "@/helpers/constants";
import UserModel from "@/models/UserModel";

export class UserRepository {
  private db: typeof database;

  constructor(databaseInstance = database) {
    this.db = databaseInstance;
  }

  async checkIfUserExist(email: UserModel["email"], phone: UserModel["phone"]) {
    return await this.db<UserModel>(SCHEMA_TABLES.USERS)
      .select("email", "phone", "id")
      .where({ email })
      .orWhere({ phone });
  }

  async createUser(
    trx: Knex.Knex.Transaction,
    param: Pick<UserModel, "email" | "password" | "phone" | "timezone">,
  ) {
    return await trx<UserModel>(SCHEMA_TABLES.USERS).insert(param).returning("*").first();
  }

  async getUserById(id: string) {
    return await this.db<UserModel>(SCHEMA_TABLES.USERS).select().where({ id }).first();
  }

  async updateUser(
    trx: Knex.Knex.Transaction,
    id: string,
    userData: Partial<
      Omit<UserModel, "createdAt" | "deletedAt" | "email" | "id" | "phone" | "updatedAt">
    >,
  ) {
    return trx<UserModel>(SCHEMA_TABLES.USERS)
      .update({ ...userData, updatedAt: this.db.fn.now() }, "*")
      .where({ id })
      .first();
  }
}
