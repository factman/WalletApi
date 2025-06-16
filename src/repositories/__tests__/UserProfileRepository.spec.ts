/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserProfileRepository } from "../UserProfileRepository.js";

const mockTable = {
  first: vi.fn(),
  select: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
};

const mockDatabase = {
  // Simulate whatever is needed for the Repository base class
  // For this test, we only care about .table
  table: vi.fn().mockReturnValue(mockTable),
};

vi.mock("../Repository", () => {
  return {
    Repository: class {
      protected table = mockTable;
    },
  };
});

describe("UserProfileRepository", () => {
  let repo: UserProfileRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new UserProfileRepository(mockDatabase as any);
  });

  it("should instantiate with the correct table", () => {
    expect(repo).toBeInstanceOf(UserProfileRepository);
  });

  it("getUserById should query with correct userId and return the first result", async () => {
    const userId = "user-123";
    const expectedUser = { name: "Test User", userId };
    mockTable.first.mockResolvedValueOnce(expectedUser);

    const result = await repo.getUserById(userId);

    expect(mockTable.select).toHaveBeenCalled();
    expect(mockTable.where).toHaveBeenCalledWith({ userId });
    expect(mockTable.first).toHaveBeenCalled();
    expect(result).toBe(expectedUser);
  });

  it("getUserById should return undefined if user not found", async () => {
    const userId = "not-found";
    mockTable.first.mockResolvedValueOnce(undefined);

    const result = await repo.getUserById(userId);

    expect(result).toBeUndefined();
  });

  it("should use the default database instance if none is provided", () => {
    // Just check that it doesn't throw
    expect(() => new UserProfileRepository()).not.toThrow();
  });
});
