import database from "../configs/database.js";
import { SCHEMA_VIEWS } from "../helpers/constants.js";
import UserProfileModel from "../models/UserProfileModel.js";
import { Repository } from "./Repository.js";

export class UserProfileRepository extends Repository<UserProfileModel> {
  constructor(databaseInstance = database) {
    super(SCHEMA_VIEWS.USERS_PROFILES, databaseInstance);
  }

  async getUserById(userId: UserProfileModel["userId"]) {
    return await this.table.select().where({ userId }).first();
  }
}
