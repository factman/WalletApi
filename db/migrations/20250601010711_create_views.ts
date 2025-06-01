import type { Knex } from "knex";

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropViewIfExists("authenticatedUsers").dropViewIfExists("userProfiles");
}

export async function up(knex: Knex): Promise<void> {
  return (
    knex.schema
      // Create authenticatedUsers view
      .createViewOrReplace("authenticatedUsers", (view) => {
        view.columns([
          "deviceId",
          "email",
          "ipAddress",
          "isBlacklisted",
          "isEmailVerified",
          "isKycVerified",
          "isPasswordResetRequired",
          "isTwoFactorEnabled",
          "lastLogin",
          "phone",
          "sessionExpiresAt",
          "sessionId",
          "status",
          "timezone",
          "userAgent",
          "userId",
        ]);
        view.as(
          knex
            .select(
              "deviceId",
              "email",
              "ipAddress",
              "isBlacklisted",
              "isEmailVerified",
              "isKycVerified",
              "isPasswordResetRequired",
              "isTwoFactorEnabled",
              "lastLogin",
              "phone",
              "sessions.expiresAt as sessionExpiresAt",
              "sessions.id as sessionId",
              "status",
              "timezone",
              "userAgent",
              "users.id as userId",
            )
            .from("sessions")
            .innerJoin("users", "sessions.userId", "users.id")
            .where("sessions.expiresAt", ">", knex.fn.now()),
        );
      })
      // Create userProfiles view
      .createViewOrReplace("userProfiles", (view) => {
        view.columns([
          "address",
          "bvn",
          "dob",
          "email",
          "firstName",
          "gender",
          "image",
          "isBlacklisted",
          "isEmailVerified",
          "isKycVerified",
          "isTwoFactorEnabled",
          "lastLogin",
          "lastName",
          "middleName",
          "phone",
          "profileId",
          "state",
          "status",
          "timezone",
          "userId",
        ]);
        view.as(
          knex
            .select(
              "address",
              "bvn",
              "dob",
              "email",
              "firstName",
              "gender",
              "image",
              "isBlacklisted",
              "isEmailVerified",
              "isKycVerified",
              "isTwoFactorEnabled",
              "lastLogin",
              "lastName",
              "middleName",
              "phone",
              "profiles.id as profileId",
              "state",
              "status",
              "timezone",
              "users.id as userId",
            )
            .from("profiles")
            .innerJoin("users", "profiles.userId", "users.id"),
        );
      })
  );
}
