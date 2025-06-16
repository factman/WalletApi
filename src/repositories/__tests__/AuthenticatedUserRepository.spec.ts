/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SCHEMA_VIEWS } from "../../helpers/constants.js";
import { AuthenticatedUserRepository } from "../AuthenticatedUserRepository.js";

const mockTable = {
  first: vi.fn(),
  from: vi.fn(() => mockTable),
  select: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
};

const mockDatabase = () => mockTable;

describe("AuthenticatedUserRepository", () => {
  let repo: AuthenticatedUserRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new AuthenticatedUserRepository(mockDatabase as any);
  });

  it("should initialize with correct table name and database", () => {
    expect((repo as any).tableName).toBe(SCHEMA_VIEWS.AUTHENTICATED_USERS);
    expect((repo as any).knex).toBe(mockDatabase);
  });

  it("getUserBySessionId should query with correct sessionId and return user", async () => {
    const sessionId = "session-123";
    const fakeUser = {
      deviceId: "dev-1",
      email: "test@example.com",
      ipAddress: "127.0.0.1",
      isBlacklisted: false,
      isEmailVerified: true,
      isKycVerified: false,
      isPasswordResetRequired: false,
      isTwoFactorEnabled: false,
      lastLogin: new Date(),
      phone: "+1234567890",
    };
    mockTable.first.mockResolvedValueOnce(fakeUser);

    const result = await repo.getUserBySessionId(sessionId);

    expect(mockTable.select).toHaveBeenCalledWith(
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
      "status",
      "timezone",
      "userId",
    );
    expect(mockTable.where).toHaveBeenCalledWith({ sessionId });
    expect(mockTable.first).toHaveBeenCalled();
    expect(result).toBe(fakeUser);
  });

  it("getUserBySessionId should return undefined if user not found", async () => {
    mockTable.first.mockResolvedValueOnce(undefined);
    const result = await repo.getUserBySessionId("notfound" as any);
    expect(result).toBeUndefined();
  });
});
