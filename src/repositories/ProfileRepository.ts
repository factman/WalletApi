import Knex from "knex";

import database from "../configs/database";
import { SCHEMA_TABLES } from "../helpers/constants";
import ProfileModel from "../models/ProfileModel";
import { Repository } from "./Repository";

export class ProfileRepository extends Repository<ProfileModel> {
  constructor(databaseInstance = database) {
    super(SCHEMA_TABLES.PROFILES, databaseInstance);
  }

  async createUserProfile(
    trx: Knex.Knex.Transaction,
    profile: Omit<ProfileModel, "createdAt" | "id" | "updatedAt">,
  ) {
    const id = this.uuid;
    await this.table
      .insert({ ...profile, createdAt: this.knex.fn.now(), id, updatedAt: this.knex.fn.now() })
      .transacting(trx);
    return await this.table.where({ id }).transacting(trx).first();
  }
}
