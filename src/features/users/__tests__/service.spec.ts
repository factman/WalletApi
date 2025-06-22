/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CustomError } from "../../../helpers/errorInstance";
import * as utilities from "../../../helpers/utilities";
import { UserStatus } from "../../../models/UserModel";
import { UsersService } from "../service";

describe("UsersService", () => {
  let usersService: UsersService;
  let mockTrx: any;
  let mockUserRepository: any;
  let mockUserProfileRepository: any;
  let mockSessionRepository: any;

  beforeEach(() => {
    mockTrx = {};
    mockUserRepository = {
      deleteUserById: vi.fn(),
      updateUser: vi.fn(),
    };
    mockUserProfileRepository = {
      getUserById: vi.fn(),
    };
    mockSessionRepository = {
      deleteSession: vi.fn(),
    };
    usersService = new UsersService(
      mockUserProfileRepository,
      mockUserRepository,
      mockSessionRepository,
    );
  });

  describe("changeUserPassword", () => {
    it("should hash the new password and update the user", async () => {
      const userId = "1";
      const newPassword = "newpass";
      const hashed = "hashedpass";
      vi.spyOn(utilities, "hashPassword").mockResolvedValue(hashed);

      mockUserRepository.updateUser.mockResolvedValue(undefined);

      await usersService.changeUserPassword(mockTrx, userId, newPassword);

      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(mockTrx, userId, {
        isPasswordResetRequired: false,
        password: hashed,
      });
    });
  });

  describe("deleteUserAccount", () => {
    it("should delete session and user, and return user if deleted", async () => {
      const userId = "2";
      const deletedUser = { id: userId, status: UserStatus.DELETED };
      mockSessionRepository.deleteSession.mockResolvedValue(undefined);
      mockUserRepository.deleteUserById.mockResolvedValue(deletedUser);

      const result = await usersService.deleteUserAccount(mockTrx, userId);

      expect(mockSessionRepository.deleteSession).toHaveBeenCalledWith(mockTrx, userId);
      expect(mockUserRepository.deleteUserById).toHaveBeenCalledWith(mockTrx, userId);
      expect(result).toEqual({ user: deletedUser });
    });

    it("should throw if user is not found or not deleted", async () => {
      mockSessionRepository.deleteSession.mockResolvedValue(undefined);
      mockUserRepository.deleteUserById.mockResolvedValue(null);

      await expect(usersService.deleteUserAccount(mockTrx, "3")).rejects.toThrow(CustomError);
    });
  });

  describe("getUserProfile", () => {
    it("should return profile if found", async () => {
      const userId = "4";
      const profile = { userId };
      mockUserProfileRepository.getUserById.mockResolvedValue(profile);

      const result = await usersService.getUserProfile(userId);

      expect(mockUserProfileRepository.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ profile });
    });

    it("should throw if profile not found", async () => {
      mockUserProfileRepository.getUserById.mockResolvedValue(null);

      await expect(usersService.getUserProfile("5")).rejects.toThrow(CustomError);
    });
  });

  describe("verifyOldPassword", () => {
    it("should return true if password matches", async () => {
      const user = { password: "hashed" } as any;
      const oldPassword = "plain";
      vi.spyOn(bcrypt, "compare").mockResolvedValue(true as any);

      const result = await usersService.verifyOldPassword(user, oldPassword);

      expect(result).toBe(true);
    });

    it("should throw if password does not match", async () => {
      const user = { password: "hashed" } as any;
      const oldPassword = "plain";
      vi.spyOn(bcrypt, "compare").mockResolvedValue(false as any);

      await expect(usersService.verifyOldPassword(user, oldPassword)).rejects.toThrow(CustomError);
    });
  });
});
