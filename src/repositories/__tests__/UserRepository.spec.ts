/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserStatus } from "../../models/UserModel.js";
import { UserRepository } from "../UserRepository.js";

const mockTrx = {} as any;
const mockTable = {
  first: vi.fn(),
  insert: vi.fn().mockReturnThis(),
  orWhere: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  transacting: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
};
const mockKnex = { fn: { now: vi.fn() } };

vi.mock("../Repository", () => ({
  Repository: class {
    knex = mockKnex;
    table = mockTable;
    uuid = "mock-uuid";
  },
}));

describe("UserRepository", () => {
  let repo: UserRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new UserRepository();
  });

  describe("blacklistUserById", () => {
    it("should update user to blacklisted and return the user", async () => {
      mockTable.first.mockResolvedValueOnce({ id: "1", isBlacklisted: true });
      const result = await repo.blacklistUserById(mockTrx, "1");
      expect(mockTable.update).toHaveBeenCalledWith({
        isBlacklisted: true,
        status: UserStatus.BLACKLISTED,
      });
      expect(mockTable.where).toHaveBeenCalledWith({ id: "1" });
      expect(result).toEqual({ id: "1", isBlacklisted: true });
    });
  });

  describe("checkIfUserExist", () => {
    it("should check if user exists by email or phone", async () => {
      mockTable.orWhere.mockReturnThis();
      mockTable.select.mockReturnThis();
      const expected = [{ email: "a@b.com", id: "1", phone: "123" }];
      mockTable.where.mockReturnThis();
      mockTable.select.mockReturnThis();
      mockTable.orWhere.mockResolvedValueOnce(expected);
      const result = await repo.checkIfUserExist("a@b.com", "123");
      expect(mockTable.select).toHaveBeenCalledWith("email", "phone", "id");
      expect(mockTable.where).toHaveBeenCalledWith({ email: "a@b.com" });
      expect(mockTable.orWhere).toHaveBeenCalledWith({ phone: "123" });
      expect(result).toBe(expected);
    });
  });

  describe("createUser", () => {
    it("should insert and return the new user", async () => {
      const param = { email: "a@b.com", password: "pw", phone: "123", timezone: "UTC" };
      mockTable.insert.mockReturnThis();
      mockTable.select.mockReturnThis();
      mockTable.where.mockReturnThis();
      mockTable.transacting.mockReturnThis();
      mockTable.first.mockResolvedValueOnce({ ...param, id: "mock-uuid" });
      const result = await repo.createUser(mockTrx, param);
      expect(mockTable.insert).toHaveBeenCalledWith({ ...param, id: "mock-uuid" });
      expect(result).toEqual({ ...param, id: "mock-uuid" });
    });
  });

  describe("deleteUserById", () => {
    it("should update user as deleted and return the user", async () => {
      mockTable.update.mockReturnThis();
      mockTable.where.mockReturnThis();
      mockTable.transacting.mockReturnThis();
      mockTable.select.mockReturnThis();
      mockTable.first.mockResolvedValueOnce({ id: "1", status: UserStatus.DELETED });
      const result = await repo.deleteUserById(mockTrx, "1");
      expect(mockTable.update).toHaveBeenCalledWith({
        deletedAt: mockKnex.fn.now(),
        status: UserStatus.DELETED,
      });
      expect(result).toEqual({ id: "1", status: UserStatus.DELETED });
    });
  });

  describe("getUserByEmail", () => {
    it("should return user by email", async () => {
      mockTable.select.mockReturnThis();
      mockTable.where.mockReturnThis();
      mockTable.first.mockResolvedValueOnce({ email: "a@b.com" });
      const result = await repo.getUserByEmail("a@b.com");
      expect(mockTable.where).toHaveBeenCalledWith({ email: "a@b.com" });
      expect(result).toEqual({ email: "a@b.com" });
    });
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      mockTable.select.mockReturnThis();
      mockTable.where.mockReturnThis();
      mockTable.first.mockResolvedValueOnce({ id: "1" });
      const result = await repo.getUserById("1");
      expect(mockTable.where).toHaveBeenCalledWith({ id: "1" });
      expect(result).toEqual({ id: "1" });
    });
  });

  describe("updateUser", () => {
    it("should update user and return the updated user", async () => {
      const userData = { isBlacklisted: false, status: UserStatus.VERIFIED };
      mockTable.update.mockReturnThis();
      mockTable.where.mockReturnThis();
      mockTable.transacting.mockReturnThis();
      mockTable.select.mockReturnThis();
      mockTable.first.mockResolvedValueOnce({ id: "1", ...userData });
      const result = await repo.updateUser(mockTrx, "1", userData);
      expect(mockTable.update).toHaveBeenCalledWith(userData);
      expect(result).toEqual({ id: "1", ...userData });
    });
  });
});
