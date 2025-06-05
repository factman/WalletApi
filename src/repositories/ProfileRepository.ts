import Knex from "knex";

import database from "@/configs/database";
import { SCHEMA_TABLES } from "@/helpers/constants";
import ProfileModel from "@/models/ProfileModel";

import { Repository } from "./Repository";

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
