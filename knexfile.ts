import { Knex } from "knex";

import { env, EnvType } from "./src/configs/env";

function getDatabaseConfig(nodeEnvironment: EnvType["NODE_ENV"]): Knex.Config {
  switch (nodeEnvironment) {
    case "development":
    case "production":
      return {
        client: "mysql2",
        connection: {
          database: env.DB_NAME,
          host: env.DB_HOST,
          password: env.DB_PASSWORD,
          port: env.DB_PORT,
          user: env.DB_USER,
        },
      };
    case "test":
    default:
      return {
        client: "sqlite3",
        connection: {
          filename: ":memory:", // Use in-memory database for tests
        },
        useNullAsDefault: true, // SQLite requires this
      };
  }
}

export default {
  ...getDatabaseConfig(env.NODE_ENV),
  compileSqlOnError: false,
  migrations: {
    directory: "./db/migrations",
  },
  seeds: {
    directory: "./db/seeds",
  },
} as Knex.Config;
