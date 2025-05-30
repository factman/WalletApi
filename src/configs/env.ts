/* eslint-disable @typescript-eslint/no-non-null-assertion */

const variables = {
  DB_HOST: process.env.DB_HOST!,
  DB_NAME: process.env.DB_NAME!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  DB_PORT: Number(process.env.DB_PORT!),
  DB_USER: process.env.DB_USER!,
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT!),
} as const;

export type EnvType = typeof variables & {
  readonly NODE_ENV: "development" | "production" | "test";
};

export const env = variables as EnvType;
