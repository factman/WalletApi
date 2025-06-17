/* eslint-disable @typescript-eslint/no-explicit-any */
import Knex from "knex";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SessionRepository } from "../SessionRepository.js";

const mockTrx = {} as Knex.Knex.Transaction;

const mockTable = {
  del: vi.fn().mockReturnThis(),
  first: vi.fn(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  transacting: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
};

const mockKnex = {
  fn: {
    now: vi.fn(),
  },
};

class TestSessionRepository extends SessionRepository {
  get table() {
    return mockTable as any;
  }

  constructor() {
    super({} as any);
    this.knex = mockKnex as any;
  }
}

describe("SessionRepository", () => {
  let repo: TestSessionRepository;

  beforeEach(() => {
    repo = new TestSessionRepository();
    mockKnex.fn.now.mockReset();
  });

  describe("createSession", () => {
    it("should insert session and return created session", async () => {
      mockTable.insert.mockReturnValueOnce(Promise.resolve([123]));
      mockTable.where.mockReturnValueOnce({
        transacting: () => ({ first: () => Promise.resolve({ id: 123 }) }),
      });

      const sessionData = {
        accessToken: "token",
        deviceId: "d1",
        expiresAt: new Date(),
        id: "s1",
        userId: "u1",
      } as any;
      const result = await repo.createSession(mockTrx, sessionData);

      expect(mockTable.insert).toHaveBeenCalledWith(sessionData);
      expect(result).toEqual({ id: 123 });
    });
  });

  describe("deleteSession", () => {
    it("should delete session by userId", async () => {
      mockTable.where.mockReturnValueOnce({
        del: () => ({ transacting: () => Promise.resolve() }),
      });

      await repo.deleteSession(mockTrx, "user-123");
      expect(mockTable.where).toHaveBeenCalledWith({ userId: "user-123" });
    });
  });

  describe("getActiveSession", () => {
    it("should query for active session with correct filters", async () => {
      const whereChain = {
        first: vi.fn().mockResolvedValue({ id: "s1" }),
        where: vi.fn().mockReturnThis(),
      };
      mockTable.select.mockReturnValue(whereChain);
      whereChain.where.mockReturnThis();
      mockKnex.fn.now.mockReturnValue("now");

      const session = { deviceId: "d1", id: "s1", userId: "u1" };
      const result = await repo.getActiveSession(session);

      expect(mockTable.select).toHaveBeenCalled();
      expect(whereChain.where).toHaveBeenCalledWith({ ...session });
      expect(whereChain.where).toHaveBeenCalledWith("accessTokenExpiresAt", ">", "now");
      expect(whereChain.where).toHaveBeenCalledWith("expiresAt", ">", "now");
      expect(result).toEqual({ id: "s1" });
    });
  });

  describe("getSessionById", () => {
    it("should return session by id", async () => {
      const whereChain = { first: vi.fn().mockResolvedValue({ id: "s1" }) };
      mockTable.select.mockReturnValue({ where: () => whereChain });

      const result = await repo.getSessionById("s1");
      expect(result).toEqual({ id: "s1" });
    });
  });

  describe("updateSession", () => {
    it("should update session and return updated session", async () => {
      mockTable.update.mockReturnValueOnce({
        where: () => ({ transacting: () => Promise.resolve() }),
      });
      mockTable.where.mockReturnValueOnce({
        transacting: () => ({ first: () => Promise.resolve({ foo: "bar", id: "s1" }) }),
      });

      const result = await repo.updateSession(mockTrx, "s1", { foo: "bar" } as any);
      expect(result).toEqual({ foo: "bar", id: "s1" });
    });
  });
});
