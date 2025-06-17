import Knex from "knex";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WalletStatus } from "../../models/WalletModel.js";
import { WalletRepository } from "../WalletRepository.js";

const trx = {} as Knex.Knex.Transaction;

const mockTable = {
  decrement: vi.fn().mockReturnThis(),
  first: vi.fn(),
  forUpdate: vi.fn().mockReturnThis(),
  increment: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  transacting: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
};

vi.mock("../Repository", () => {
  return {
    Repository: class {
      protected table = mockTable;
      protected uuid = "mock-uuid";
    },
  };
});

describe("WalletRepository", () => {
  let repo: WalletRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new WalletRepository();
  });

  it("addPinToWallet updates pin and returns wallet", async () => {
    mockTable.first.mockResolvedValue({ accountName: "Test", id: "1" });
    const result = await repo.addPinToWallet(trx, "1", "1234");
    expect(mockTable.update).toHaveBeenCalledWith({
      isTransactionPinSet: true,
      status: WalletStatus.ACTIVE,
      transactionPin: "1234",
    });
    expect(mockTable.where).toHaveBeenCalledWith({ id: "1" });
    expect(result).toEqual({ accountName: "Test", id: "1" });
  });

  it("addSettlementAccountToWallet updates settlement account and returns wallet", async () => {
    mockTable.first.mockResolvedValue({ accountName: "Test2", id: "2" });
    const settlementAccount = {
      settlementAccountName: "Name",
      settlementAccountNumber: "123",
      settlementBankCode: "001",
    };
    const result = await repo.addSettlementAccountToWallet(trx, "2", settlementAccount);
    expect(mockTable.update).toHaveBeenCalledWith({
      ...settlementAccount,
      isSettlementAccountSet: true,
    });
    expect(mockTable.where).toHaveBeenCalledWith({ id: "2" });
    expect(result).toEqual({ accountName: "Test2", id: "2" });
  });

  it("createUserWallet inserts and returns wallet", async () => {
    mockTable.first.mockResolvedValue({ accountName: "User", id: "mock-uuid" });
    const walletData = { accountName: "User", accountNumber: "111", userId: "u1" };
    const result = await repo.createUserWallet(trx, walletData);
    expect(mockTable.insert).toHaveBeenCalledWith({ ...walletData, id: "mock-uuid" });
    expect(mockTable.where).toHaveBeenCalledWith({ id: "mock-uuid" });
    expect(result).toEqual({ accountName: "User", id: "mock-uuid" });
  });

  it("decreaseWalletBalance decrements balance", async () => {
    await repo.decreaseWalletBalance(trx, "3", 50);
    expect(mockTable.decrement).toHaveBeenCalledWith("balance", 50);
    expect(mockTable.where).toHaveBeenCalledWith({ id: "3" });
    expect(mockTable.transacting).toHaveBeenCalledWith(trx);
  });

  it("increaseWalletBalance increments balance", async () => {
    await repo.increaseWalletBalance(trx, "4", 75);
    expect(mockTable.increment).toHaveBeenCalledWith("balance", 75);
    expect(mockTable.where).toHaveBeenCalledWith({ id: "4" });
    expect(mockTable.transacting).toHaveBeenCalledWith(trx);
  });

  it("getWalletByAccountNumber returns wallet", async () => {
    mockTable.first.mockResolvedValue({ accountName: "Acc", accountNumber: "555", id: "5" });
    const result = await repo.getWalletByAccountNumber("555");
    expect(mockTable.select).toHaveBeenCalledWith("accountName", "accountNumber", "id");
    expect(mockTable.where).toHaveBeenCalledWith({ accountNumber: "555" });
    expect(result).toEqual({ accountName: "Acc", accountNumber: "555", id: "5" });
  });

  it("getWalletById returns wallet", async () => {
    mockTable.first.mockResolvedValue({ id: "6" });
    const result = await repo.getWalletById(trx, "6");
    expect(mockTable.transacting).toHaveBeenCalledWith(trx);
    expect(mockTable.forUpdate).toHaveBeenCalled();
    expect(mockTable.where).toHaveBeenCalledWith({ id: "6" });
    expect(result).toEqual({ id: "6" });
  });

  it("getWalletByUserId returns wallet", async () => {
    mockTable.first.mockResolvedValue({ id: "7", userId: "u7" });
    const result = await repo.getWalletByUserId("u7");
    expect(mockTable.select).toHaveBeenCalled();
    expect(mockTable.where).toHaveBeenCalledWith({ userId: "u7" });
    expect(result).toEqual({ id: "7", userId: "u7" });
  });
});
