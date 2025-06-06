import Knex from "knex";

import database from "../configs/database.js";
import { SCHEMA_TABLES } from "../helpers/constants.js";
import ProfileModel from "../models/ProfileModel.js";
import { Repository } from "./Repository.js";

export class ProfileRepository extends Repository<ProfileModel> {
  constructor(databaseInstance = database) {
    super(SCHEMA_TABLES.PROFILES, databaseInstance);
  }

  async createUserProfile(
    trx: Knex.Knex.Transaction,
    profile: Omit<ProfileModel, "createdAt" | "id" | "updatedAt">,
  ) {
    const id = this.uuid;
    await this.table.insert({ ...profile, id }).transacting(trx);
    return await this.table.where({ id }).transacting(trx).first();
  }
}
