/* eslint-disable @typescript-eslint/no-non-null-assertion */

const variables = {
  ACCESS_TOKEN_EXPIRATION: Number(process.env.ACCESS_TOKEN_EXPIRATION!),
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  ADJUTOR_API_KEY: process.env.ADJUTOR_API_KEY!,
  ADJUTOR_API_URL: process.env.ADJUTOR_API_URL!,
  DB_HOST: process.env.DB_HOST!,
  DB_NAME: process.env.DB_NAME!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  DB_PORT: Number(process.env.DB_PORT!),
  DB_USER: process.env.DB_USER!,
  NODE_ENV: (process.env.NODE_ENV ?? "development") as "development" | "production" | "test",
  PORT: Number(process.env.PORT!),
  REFRESH_TOKEN_EXPIRATION: Number(process.env.REFRESH_TOKEN_EXPIRATION!),
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  RESEND_SENDER: process.env.RESEND_SENDER!,
  VERIFICATION_TOKEN_EXPIRATION: Number(process.env.VERIFICATION_TOKEN_EXPIRATION!),
  VERIFICATION_TOKEN_SECRET: process.env.VERIFICATION_TOKEN_SECRET!,
} as const;

export type EnvType = typeof variables;

export const env = variables;
