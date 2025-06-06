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
    return await this.table.transacting(trx).insert(profile, "*").first();
  }
}
