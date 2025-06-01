/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */

import Knex from "knex";

const defaultKnexConfig: Knex.Knex.Config = {
  compileSqlOnError: false,
  migrations: {
    directory: "./db/migrations",
    extension: "ts",
  },
  pool: {
    acquireTimeoutMillis: 300000,
    afterCreate: (conn: any, cb: any) => {
      conn.query("SET time_zone='+00:00'", (err: unknown) => {
        if (err) {
          console.error("Error setting timezone:", err);
          cb(err, conn);
        } else {
          conn.query("SELECT @@max_connections;", (err: unknown) => {
            cb(err, conn);
          });
        }
      });
    },
    createRetryIntervalMillis: 2000,
    createTimeoutMillis: 300000,
    destroyTimeoutMillis: 300000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
  },
  seeds: {
    directory: "./db/seeds",
    extension: "ts",
  },
};

const knexConfig: Record<"development" | "production" | "test", Knex.Knex.Config> = {
  development: {
    client: "mysql2",
    connection: {
      database: process.env.DB_NAME ?? "demo_wallet",
      host: process.env.DB_HOST ?? "localhost",
      password: process.env.DB_PASSWORD ?? "",
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? "root",
    },
    ...defaultKnexConfig,
  },
  production: {
    client: "mysql2",
    connection: {
      database: process.env.DB_NAME ?? "",
      host: process.env.DB_HOST ?? "",
      password: process.env.DB_PASSWORD ?? "",
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? "",
    },
    ...defaultKnexConfig,
  },
  test: {
    client: "sqlite3",
    connection: {
      filename: ":memory:", // Use in-memory database for tests
    },
    useNullAsDefault: true, // SQLite requires this
    ...defaultKnexConfig,
  },
};

export default knexConfig;
