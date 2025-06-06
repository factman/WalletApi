import database from "../configs/database.js";
import { SCHEMA_TABLES, SCHEMA_VIEWS } from "../helpers/constants.js";

export abstract class Repository<ModelInterface extends object> {
  protected knex: typeof database;
  protected tableName: SCHEMA_TABLES | SCHEMA_VIEWS;

  protected get table() {
    return this.knex<ModelInterface>(SCHEMA_TABLES.USERS);
  }

  constructor(tableName: SCHEMA_TABLES | SCHEMA_VIEWS, knex = database) {
    this.knex = knex;
    this.tableName = tableName;
  }
}
