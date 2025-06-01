import bcrypt from "bcryptjs";
import Knex from "knex";

export async function seed(knex: Knex.Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("users").del();

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash("password123$", salt);

  // Inserts seed entries
  await knex("users").insert({
    createdAt: new Date(),
    deletedAt: null,
    email: "johndoe@gmail.com",
    id: "00000000-0000-0000-0000-000000000001",
    isBlacklisted: false,
    isEmailVerified: true,
    isKycVerified: true,
    isPasswordResetRequired: false,
    isTwoFactorEnabled: true,
    lastLogin: null,
    password: hashedPassword,
    phone: "08012345678",
    status: "verified",
    timezone: "Africa/Lagos",
    updatedAt: new Date(),
  });
}
