/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SCHEMA_TABLES } from "../../helpers/constants";
import ProfileModel from "../../models/ProfileModel";
import { ProfileRepository } from "../ProfileRepository";

vi.mock("node:crypto", () => ({
  randomUUID: vi.fn().mockReturnValue("test-uuid"),
}));

describe("ProfileRepository", () => {
  let mockDb: any;
  let repo: any;
  let trx: any;
  let mockTable: any;

  beforeEach(() => {
    trx = {};
    mockTable = {
      first: vi.fn(),
      fn: {
        now: vi.fn().mockReturnValue("NOW()"),
      },
      insert: vi.fn().mockReturnThis(),
      transacting: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
    };
    mockDb = () => mockTable;
    mockDb.fn = mockTable.fn;
    repo = new ProfileRepository(mockDb);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call insert and return the created profile", async () => {
    const profileData = {
      email: "john@example.com",
      name: "John Doe",
    } as unknown as Omit<ProfileModel, "createdAt" | "id" | "updatedAt">;

    const expectedProfile = { ...profileData, id: "test-uuid" };
    mockDb().first.mockResolvedValue(expectedProfile);

    const result = await repo.createUserProfile(trx, profileData);

    expect(mockTable.insert).toHaveBeenCalledWith({
      ...profileData,
      createdAt: "NOW()",
      id: "test-uuid",
      updatedAt: "NOW()",
    });
    expect(mockTable.insert).toHaveBeenCalled();
    expect(mockTable.where).toHaveBeenCalledWith({ id: "test-uuid" });
    expect(mockTable.transacting).toHaveBeenCalledWith(trx);
    expect(mockTable.first).toHaveBeenCalled();
    expect(result).toEqual(expectedProfile);
  });

  it("should use the correct table name", () => {
    expect(repo.tableName).toBe(SCHEMA_TABLES.PROFILES);
  });

  it("should throw if insert fails", async () => {
    const profileData = {
      email: "jane@example.com",
      name: "Jane Doe",
    } as unknown as Omit<ProfileModel, "createdAt" | "id" | "updatedAt">;

    mockDb().insert.mockImplementation(() => {
      throw new Error("Insert failed");
    });

    await expect(repo.createUserProfile(trx, profileData)).rejects.toThrow("Insert failed");
  });
});
