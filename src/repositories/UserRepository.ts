import Knex from "knex";

import database from "../configs/database.js";
import { SCHEMA_TABLES } from "../helpers/constants.js";
import UserModel, { UserStatus } from "../models/UserModel.js";
import { Repository } from "./Repository.js";

export class UserRepository extends Repository<UserModel> {
  constructor(databaseInstance = database) {
    super(SCHEMA_TABLES.USERS, databaseInstance);
  }

  async blacklistUserById(trx: Knex.Knex.Transaction, id: UserModel["id"]) {
    await this.table
      .update({ isBlacklisted: true, status: UserStatus.BLACKLISTED })
      .where({ id })
      .transacting(trx);

    return await this.table.select().where({ id }).first();
  }

  async checkIfUserExist(email: UserModel["email"], phone: UserModel["phone"]) {
    return await this.table.select("email", "phone", "id").where({ email }).orWhere({ phone });
  }

  async createUser(
    trx: Knex.Knex.Transaction,
    param: Pick<UserModel, "email" | "password" | "phone" | "timezone">,
  ) {
    const id = this.uuid;
    await this.table.insert({ ...param, id }).transacting(trx);
    return await this.table.select().where({ id }).transacting(trx).first();
  }

  async deleteUserById(trx: Knex.Knex.Transaction, id: UserModel["id"]) {
    await this.table
      .update({
        deletedAt: this.knex.fn.now(),
        status: UserStatus.DELETED,
      })
      .where({ id })
      .transacting(trx);

    return await this.table.select().where({ id }).transacting(trx).first();
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
    await this.table
      .update({ ...userData })
      .where({ id })
      .transacting(trx);

    return await this.table.select().where({ id }).transacting(trx).first();
  }
}
