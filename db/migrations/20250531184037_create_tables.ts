import type { Knex } from "knex";

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists("transactions")
    .dropTableIfExists("wallets")
    .dropTableIfExists("profiles")
    .dropTableIfExists("sessions")
    .dropTableIfExists("users");
}

export async function up(knex: Knex): Promise<void> {
  return (
    knex.schema
      // Create users table
      .createTable("users", (table) => {
        table.uuid("id").primary().unique().defaultTo(knex.fn.uuid());
        table.string("email").notNullable().unique();
        table.string("phone", 20).notNullable().unique();
        table
          .enum("status", ["blacklisted", "deleted", "suspended", "verified", "unverified"])
          .notNullable()
          .defaultTo("unverified");
        table.string("password").notNullable();
        table.string("timezone").notNullable();
        table.boolean("isEmailVerified").notNullable().defaultTo(false);
        table.boolean("isKycVerified").notNullable().defaultTo(false);
        table.boolean("isPasswordResetRequired").notNullable().defaultTo(false);
        table.boolean("isTwoFactorEnabled").notNullable().defaultTo(false);
        table.boolean("isBlacklisted").notNullable().defaultTo(false);
        table.datetime("createdAt").notNullable().defaultTo(knex.raw("CURRENT_TIMESTAMP"));
        table
          .datetime("updatedAt")
          .notNullable()
          .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
        table.datetime("deletedAt").nullable();
        table.datetime("lastLogin").nullable();
        table.index(["email", "phone"], "idx_users_email_phone");
        table.index("status", "idx_users_status");
      })
      // Create sessions table
      .createTable("sessions", (table) => {
        table.uuid("id").primary().unique().defaultTo(knex.fn.uuid());
        table
          .uuid("userId")
          .notNullable()
          .unique()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.string("ipAddress", 45).notNullable();
        table.string("userAgent").notNullable();
        table.string("deviceId").notNullable();
        table.datetime("expiresAt").notNullable();
        table.text("accessToken").notNullable();
        table.datetime("accessTokenExpiresAt").notNullable();
        table.text("refreshToken").notNullable();
        table.datetime("refreshTokenExpiresAt").notNullable();
        table.string("twoFactorCode", 6).nullable();
        table.datetime("twoFactorCodeExpiresAt").nullable();
        table.datetime("twoFactorVerifiedAt").nullable();
        table.boolean("isTwoFactorVerified").notNullable().defaultTo(false);
        table.datetime("createdAt").notNullable().defaultTo(knex.raw("CURRENT_TIMESTAMP"));
        table
          .datetime("updatedAt")
          .notNullable()
          .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
        table.index(["userId", "deviceId"], "idx_sessions_user_device");
        table.index("expiresAt", "idx_sessions_expiresAt");
      })
      // Create profiles table
      .createTable("profiles", (table) => {
        table.uuid("id").primary().unique().defaultTo(knex.fn.uuid());
        table
          .uuid("userId")
          .notNullable()
          .unique()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.string("firstName").notNullable();
        table.string("lastName").notNullable();
        table.string("middleName").nullable();
        table.date("dob").notNullable();
        table.string("gender", 6).notNullable();
        table.string("state").nullable();
        table.string("address").nullable();
        table.string("bvn", 11).notNullable();
        table.string("bvnEmail").nullable();
        table.string("bvnPhone", 20).nullable();
        table.text("bvnMetadata").notNullable();
        table.string("image").nullable();
        table.datetime("createdAt").notNullable().defaultTo(knex.raw("CURRENT_TIMESTAMP"));
        table
          .datetime("updatedAt")
          .notNullable()
          .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
        table.index("userId", "idx_profiles_userId");
        table.index(["firstName", "lastName"], "idx_profiles_name");
        table.index("bvn", "idx_profiles_bvn");
      })
      // Create wallets table
      .createTable("wallets", (table) => {
        table.uuid("id").primary().unique().defaultTo(knex.fn.uuid());
        table
          .uuid("userId")
          .notNullable()
          .unique()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.string("accountName").notNullable();
        table.string("accountNumber", 10).notNullable().unique();
        table.decimal("balance", 11, 2).unsigned().notNullable().defaultTo(0.0);
        table.decimal("lienBalance", 11, 2).unsigned().notNullable().defaultTo(0.0);
        table.string("currency", 3).notNullable().defaultTo("NGN");
        table.boolean("isSettlementAccountSet").notNullable().defaultTo(false);
        table.boolean("isTransactionPinSet").notNullable().defaultTo(false);
        table.string("settlementAccountName").nullable();
        table.string("settlementAccountNumber", 10).nullable();
        table.string("settlementBankCode", 10).nullable();
        table.string("transactionPin", 4).nullable();
        table.enum("status", ["active", "blocked", "inactive"]).notNullable().defaultTo("inactive");
        table.datetime("createdAt").notNullable().defaultTo(knex.raw("CURRENT_TIMESTAMP"));
        table
          .datetime("updatedAt")
          .notNullable()
          .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
        table.index("userId", "idx_wallets_userId");
        table.index(["accountName", "accountNumber"], "idx_wallets_account");
        table.index("status", "idx_wallets_status");
      })
      // Create transactions table
      .createTable("transactions", (table) => {
        table.uuid("id").primary().unique().defaultTo(knex.fn.uuid());
        table
          .uuid("userId")
          .notNullable()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .uuid("walletId")
          .notNullable()
          .references("id")
          .inTable("wallets")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.string("sessionId", 30).notNullable().unique();
        table.decimal("amount", 11, 2).unsigned().notNullable();
        table.string("currency", 3).notNullable().defaultTo("NGN");
        table.enum("channel", ["bank_transfer", "wallet"]).notNullable();
        table.enum("type", ["credit", "debit"]).notNullable();
        table.enum("status", ["completed", "failed", "pending"]).notNullable().defaultTo("pending");
        table.decimal("fee", 11, 2).unsigned().notNullable().defaultTo(0.0);
        table.decimal("openingBalance", 11, 2).unsigned().notNullable();
        table.decimal("closingBalance", 11, 2).unsigned().notNullable();
        table.string("remark").nullable();
        table.json("metadata").notNullable();
        table.date("settlementDate").nullable();
        table.datetime("createdAt").notNullable().defaultTo(knex.raw("CURRENT_TIMESTAMP"));
        table
          .datetime("updatedAt")
          .notNullable()
          .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
        table.index("userId", "idx_transactions_userId");
        table.index("walletId", "idx_transactions_walletId");
        table.index("sessionId", "idx_transactions_sessionId");
        table.index(["type", "status"], "idx_transactions_type_status");
        table.index(["createdAt", "settlementDate"], "idx_transactions_created_settlement");
      })
  );
}
