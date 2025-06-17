/* eslint-disable @typescript-eslint/no-explicit-any */
import Knex from "knex";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TransactionModel from "../../models/TransactionModel";
import { TransactionRepository } from "../TransactionRepository";

const mockTable = {
  count: vi.fn().mockReturnThis(),
  first: vi.fn(),
  fn: {
    now: vi.fn().mockReturnValue("NOW()"),
  },
  insert: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  transacting: vi.fn().mockResolvedValue(undefined),
  where: vi.fn().mockReturnThis(),
};

const mockDatabase = {
  // Simulate Knex instance
  // Not used directly, but passed to constructor
};

vi.mock("../Repository", () => {
  return {
    Repository: class {
      protected knex = mockTable;
      protected table = mockTable;
      protected uuid = "test-uuid";
    },
  };
});

describe("TransactionRepository", () => {
  let repo: TransactionRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new TransactionRepository(mockDatabase as any);
  });

  describe("createTransaction", () => {
    it("should insert a transaction and return the inserted row", async () => {
      const trx = {} as Knex.Knex.Transaction;
      const transaction = {
        amount: 100,
        fee: 1,
        remark: "test",
        status: "pending",
        type: "deposit",
        walletId: "wallet1",
      } as unknown as Omit<TransactionModel, "createdAt" | "currency" | "id" | "updatedAt">;

      mockTable.insert.mockReturnThis();
      mockTable.transacting.mockReturnThis();
      mockTable.where.mockReturnThis();
      mockTable.first.mockResolvedValue({ ...transaction, id: "test-uuid" });

      const result = await repo.createTransaction(trx, transaction);

      expect(mockTable.insert).toHaveBeenCalledWith({
        ...transaction,
        createdAt: "NOW()",
        id: "test-uuid",
        updatedAt: "NOW()",
      });
      expect(mockTable.transacting).toHaveBeenCalledWith(trx);
      expect(mockTable.where).toHaveBeenCalledWith({ id: "test-uuid" });
      expect(result).toEqual({ ...transaction, id: "test-uuid" });
    });
  });

  describe("getTransactionsByWalletId", () => {
    it("should return count 0 and empty transactions if no transactions found", async () => {
      mockTable.count.mockReturnThis();
      mockTable.where.mockReturnThis();
      mockTable.first.mockResolvedValue({ count: 0 });

      const result = await repo.getTransactionsByWalletId("wallet1", 0, 10);

      expect(result).toEqual({ count: 0, transactions: [] });
    });

    it("should return transactions and count if found", async () => {
      mockTable.count.mockReturnThis();
      mockTable.where.mockReturnThis();
      mockTable.first.mockResolvedValue({ count: 2 });

      const transactions = [
        {
          amount: 100,
          currency: "USD",
          fee: 1,
          id: "1",
          remark: "a",
          status: "done",
          type: "deposit",
        },
        {
          amount: 200,
          currency: "USD",
          fee: 2,
          id: "2",
          remark: "b",
          status: "done",
          type: "withdraw",
        },
      ];
      mockTable.select.mockReturnThis();
      mockTable.orderBy.mockReturnThis();
      mockTable.offset.mockReturnThis();
      mockTable.limit.mockResolvedValue(transactions);

      // Patch .limit to return transactions
      mockTable.limit = vi.fn().mockResolvedValue(transactions);

      const result = await repo.getTransactionsByWalletId("wallet1", 0, 10);

      expect(result).toEqual({ count: 2, transactions });
      expect(mockTable.select).toHaveBeenCalledWith(
        "amount",
        "currency",
        "fee",
        "id",
        "remark",
        "status",
        "type",
      );
    });
  });

  describe("getWalletTransactionById", () => {
    it("should return the transaction if found", async () => {
      const transaction = { id: "1", walletId: "wallet1" };
      mockTable.where.mockReturnThis();
      mockTable.first.mockResolvedValue(transaction);

      const result = await repo.getWalletTransactionById("1", "wallet1");

      expect(mockTable.where).toHaveBeenCalledWith({ id: "1", walletId: "wallet1" });
      expect(result).toEqual(transaction);
    });

    it("should return undefined if transaction not found", async () => {
      mockTable.where.mockReturnThis();
      mockTable.first.mockResolvedValue(undefined);

      const result = await repo.getWalletTransactionById("notfound", "wallet1");

      expect(result).toBeUndefined();
    });
  });
});
