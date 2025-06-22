import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import Knex from "knex";

import { CustomError } from "../../helpers/errorInstance";
import { hashPassword } from "../../helpers/utilities";
import UserModel, { UserStatus } from "../../models/UserModel";
import UserProfileModel from "../../models/UserProfileModel";
import { SessionRepository } from "../../repositories/SessionRepository";
import { UserProfileRepository } from "../../repositories/UserProfileRepository";
import { UserRepository } from "../../repositories/UserRepository";

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
    if (!user || user.status !== UserStatus.DELETED)
      throw new CustomError("Invalid user", StatusCodes.NOT_FOUND, {
        message: "User not found, try again",
      });

    return { user };
  }

  async getUserProfile(id: UserProfileModel["userId"]) {
    const profile = await this.userProfileRepository.getUserById(id);
    if (!profile)
      throw new CustomError("User not found", StatusCodes.NOT_FOUND, {
        message: "User not found, try again",
      });

    return { profile };
  }

  async verifyOldPassword(user: UserModel, oldPassword: UserModel["password"]) {
    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid)
      throw new CustomError("Invalid credentials", StatusCodes.BAD_REQUEST, {
        message: "Incorrect password, try again",
      });

    return isValid;
  }
}
