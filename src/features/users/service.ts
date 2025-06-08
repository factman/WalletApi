import Knex from "knex";

import { hashPassword } from "../../helpers/utilities.js";
import UserModel, { UserStatus } from "../../models/UserModel.js";
import UserProfileModel from "../../models/UserProfileModel.js";
import { SessionRepository } from "../../repositories/SessionRepository.js";
import { UserProfileRepository } from "../../repositories/UserProfileRepository.js";
import { UserRepository } from "../../repositories/UserRepository.js";

export class UsersService {
  private sessionRepository: SessionRepository;
  private userProfileRepository: UserProfileRepository;
  private userRepository: UserRepository;

  constructor(
    userProfileRepository = new UserProfileRepository(),
    userRepository = new UserRepository(),
    sessionRepository = new SessionRepository(),
  ) {
    this.userProfileRepository = userProfileRepository;
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
  }

  async changeUserPassword(
    trx: Knex.Knex.Transaction,
    userId: UserModel["id"],
    newPassword: UserModel["password"],
  ) {
    const newPasswordHash = await hashPassword(newPassword);
    await this.userRepository.updateUser(trx, userId, {
      isPasswordResetRequired: false,
      password: newPasswordHash,
    });
  }

  async deleteUserAccount(trx: Knex.Knex.Transaction, userId: UserModel["id"]) {
    await this.sessionRepository.deleteSession(trx, userId);
    const user = await this.userRepository.deleteUserById(trx, userId);
    if (!user || user.status !== UserStatus.DELETED) return { error: "User not found, try again" };

    return { user };
  }

  async getUserProfile(id: UserProfileModel["userId"]) {
    const profile = await this.userProfileRepository.getUserById(id);
    if (!profile) return { error: "User not found" };

    return { profile };
  }

  async verifyOldPassword(user: UserModel, oldPassword: UserModel["password"]) {
    const oldPasswordHash = await hashPassword(oldPassword);
    if (oldPasswordHash !== user.password) return { error: "Incorrect password, try again" };

    return { valid: true };
  }
}
