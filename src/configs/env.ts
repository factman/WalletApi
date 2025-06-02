/* eslint-disable @typescript-eslint/no-non-null-assertion */

const variables = {
  DB_HOST: process.env.DB_HOST!,
  DB_NAME: process.env.DB_NAME!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  DB_PORT: Number(process.env.DB_PORT!),
  DB_USER: process.env.DB_USER!,
  NODE_ENV: (process.env.NODE_ENV ?? "development") as "development" | "production" | "test",
  PORT: Number(process.env.PORT!),
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION!,
  REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION!,
} as const;

export type EnvType = typeof variables;

export const env = variables as EnvType;
