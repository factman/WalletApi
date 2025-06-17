import database from "../configs/database";
import { SCHEMA_VIEWS } from "../helpers/constants";
import UserProfileModel from "../models/UserProfileModel";
import { Repository } from "./Repository";

export class UserProfileRepository extends Repository<UserProfileModel> {
  constructor(databaseInstance = database) {
    super(SCHEMA_VIEWS.USERS_PROFILES, databaseInstance);
  }

  async getUserById(userId: UserProfileModel["userId"]) {
    return await this.table.select().where({ userId }).first();
  }
}
