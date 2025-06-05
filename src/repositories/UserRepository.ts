import Knex from "knex";

import database from "@/configs/database";
import { SCHEMA_TABLES } from "@/helpers/constants";
import UserModel, { UserStatus } from "@/models/UserModel";

import { Repository } from "./Repository";

export class UserRepository extends Repository<UserModel> {
  constructor(databaseInstance = database) {
    super(SCHEMA_TABLES.USERS, databaseInstance);
  }

  async blacklistUserById(trx: Knex.Knex.Transaction, id: UserModel["id"]) {
    return await this.table
      .transacting(trx)
      .update({ isBlacklisted: true, status: UserStatus.BLACKLISTED }, "*")
      .where({ id });
  }

  async checkIfUserExist(email: UserModel["email"], phone: UserModel["phone"]) {
    return await this.table.select("email", "phone", "id").where({ email }).orWhere({ phone });
  }

  async createUser(
    trx: Knex.Knex.Transaction,
    param: Pick<UserModel, "email" | "password" | "phone" | "timezone">,
  ) {
    return await this.table.transacting(trx).insert(param, "*").first();
  }

  async getUserByEmail(email: UserModel["email"]) {
    return await this.table.select().where({ email }).first();
  }

  async getUserByEmailAndPassword(email: UserModel["email"], password: UserModel["password"]) {
    return await this.table.select().where({ email, password }).first();
  }

  async getUserById(id: UserModel["id"]) {
    return await this.table.select().where({ id }).first();
  }

  async updateUser(
    trx: Knex.Knex.Transaction,
    id: UserModel["id"],
    userData: Partial<
      Omit<UserModel, "createdAt" | "deletedAt" | "email" | "id" | "phone" | "updatedAt">
    >,
  ) {
    return this.table
      .transacting(trx)
      .update({ ...userData }, "*")
      .where({ id })
      .first();
  }
}
