/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CustomError } from "../../../helpers/errorInstance";
import {
  TransactionChannel,
  TransactionStatus,
  TransactionType,
} from "../../../models/TransactionModel";
import { WalletStatus } from "../../../models/WalletModel";
import { TransactionService } from "../service";

const mockTrx = {} as any;

function mockTransaction(overrides = {}) {
  return {
    amount: "1000.00",
    channel: TransactionChannel.WALLET,
    closingBalance: "9000.00",
    currency: "NGN",
    fee: "10.00",
    id: 1,
    metadata: {},
    openingBalance: "10000.00",
    remark: "remark",
    sessionId: "sessionid",
    settlementDate: new Date(),
    status: TransactionStatus.COMPLETED,
    type: TransactionType.DEBIT,
    userId: 1,
    walletId: 1,
    ...overrides,
  };
}

function mockUser(overrides = {}) {
  return {
    email: "john@example.com",
    id: 1,
    ...overrides,
  };
}

function mockWallet(overrides = {}) {
  return {
    accountName: "John Doe",
    accountNumber: "1234567890",
    balance: "10000.00",
    id: 1,
    settlementAccountName: "John Doe",
    settlementAccountNumber: "9876543210",
    status: WalletStatus.ACTIVE,
    transactionPin: "$2a$10$hashedpin",
    userId: 1,
    ...overrides,
  };
}

vi.mock("bcryptjs", () => ({
  default: {
    compareSync: vi.fn((pin, hash) => pin === "1234" && hash !== ""),
  },
}));

describe("TransactionService", () => {
  let service: TransactionService;
  let walletRepository: any;
  let transactionRepository: any;
  let resendService: any;
  let userRepository: any;

  beforeEach(() => {
    walletRepository = {
      decreaseWalletBalance: vi.fn(),
      getWalletByAccountNumber: vi.fn(),
      getWalletById: vi.fn(),
      increaseWalletBalance: vi.fn(),
    };
    transactionRepository = {
      createTransaction: vi.fn(),
      getTransactionsByWalletId: vi.fn(),
      getWalletTransactionById: vi.fn(),
    };
    resendService = {
      sendTransactionReceipt: vi.fn(),
    };
    userRepository = {
      getUserById: vi.fn(),
    };
    service = new TransactionService(
      transactionRepository,
      walletRepository,
      resendService,
      userRepository,
    );
  });

  describe("getBeneficiaryWallet", () => {
    it("returns wallet if found", async () => {
      walletRepository.getWalletByAccountNumber.mockResolvedValue(mockWallet());
      const wallet = await service.getBeneficiaryWallet("1234567890");
      expect(wallet).toBeTruthy();
    });

    it("throws if wallet not found", async () => {
      walletRepository.getWalletByAccountNumber.mockResolvedValue(undefined);
      await expect(service.getBeneficiaryWallet("bad")).rejects.toThrow(CustomError);
    });
  });

  describe("getWalletHistory", () => {
    it("returns transactions", async () => {
      transactionRepository.getTransactionsByWalletId.mockResolvedValue([mockTransaction()]);
      const txs = await service.getWalletHistory("1", 0, 10);
      expect(txs).toHaveLength(1);
    });
  });

  describe("getWalletTransaction", () => {
    it("returns transaction if found", async () => {
      transactionRepository.getWalletTransactionById.mockResolvedValue(mockTransaction());
      const result = await service.getWalletTransaction("1", "1");
      expect(result.transaction).toBeTruthy();
    });

    it("throws if not found", async () => {
      transactionRepository.getWalletTransactionById.mockResolvedValue(undefined);
      await expect(service.getWalletTransaction("1", "1")).rejects.toThrow(CustomError);
    });
  });

  describe("transferToWallet", () => {
    it("throws if sender wallet not found", async () => {
      walletRepository.getWalletById.mockResolvedValue(undefined);
      await expect(
        service.transferToWallet(
          mockTrx,
          "1",
          { accountName: "Jane", accountNumber: "222", id: "2" },
          { amount: 100, remark: "", transactionPin: "1234" } as any,
        ),
      ).rejects.toThrow("Invalid wallet");
    });

    it("throws if transaction pin not provided", async () => {
      walletRepository.getWalletById.mockResolvedValue(mockWallet());
      await expect(
        service.transferToWallet(
          mockTrx,
          "1",
          { accountName: "Jane", accountNumber: "222", id: "2" },
          { amount: 100, remark: "", transactionPin: undefined } as any,
        ),
      ).rejects.toThrow("Invalid credentials");
    });

    it("throws if transaction pin is invalid", async () => {
      walletRepository.getWalletById.mockResolvedValue({
        ...mockWallet(),
        transactionPin: "notempty",
      });
      // bcrypt.compareSync will return false for pin !== "1234"
      await expect(
        service.transferToWallet(
          mockTrx,
          "1",
          { accountName: "Jane", accountNumber: "222", id: "2" },
          { amount: 100, remark: "", transactionPin: "wrong" } as any,
        ),
      ).rejects.toThrow("Invalid credentials");
    });

    it("throws if wallet is not active", async () => {
      walletRepository.getWalletById.mockResolvedValue({
        ...mockWallet(),
        status: WalletStatus.INACTIVE,
      });
      await expect(
        service.transferToWallet(
          mockTrx,
          "1",
          { accountName: "Jane", accountNumber: "222", id: "2" },
          { amount: 100, remark: "", transactionPin: "1234" } as any,
        ),
      ).rejects.toThrow("Inactive wallet");
    });

    it("throws if insufficient funds", async () => {
      walletRepository.getWalletById.mockResolvedValue({ ...mockWallet({ balance: "50.00" }) });
      await expect(
        service.transferToWallet(
          mockTrx,
          "1",
          { accountName: "Jane", accountNumber: "222", id: "2" },
          { amount: 100, remark: "", transactionPin: "1234" } as any,
        ),
      ).rejects.toThrow("Transfer failed");
    });

    it("calls debit and credit on success", async () => {
      walletRepository.getWalletById.mockResolvedValue(mockWallet());
      vi.spyOn(service as any, "debitWalletBalance").mockResolvedValue("debitTx");
      vi.spyOn(service as any, "creditWalletBalance").mockResolvedValue("creditTx");
      const result = await service.transferToWallet(
        mockTrx,
        "1",
        { accountName: "Jane", accountNumber: "222", id: "2" },
        { amount: 100, remark: "test", transactionPin: "1234" } as any,
      );
      expect(result).toBe("debitTx");
    });
  });

  describe("withdrawToSettlementAccount", () => {
    it("throws if wallet not found", async () => {
      walletRepository.getWalletById.mockResolvedValue(undefined);
      await expect(
        service.withdrawToSettlementAccount(mockTrx, "1", {
          amount: 100,
          remark: "",
          transactionPin: "1234",
        }),
      ).rejects.toThrow("Invalid wallet");
    });

    it("throws if transaction pin not provided", async () => {
      walletRepository.getWalletById.mockResolvedValue(mockWallet());
      await expect(
        service.withdrawToSettlementAccount(mockTrx, "1", {
          amount: 100,
          remark: "",
          transactionPin: undefined as any,
        }),
      ).rejects.toThrow("Invalid credentials");
    });

    it("throws if transaction pin is invalid", async () => {
      walletRepository.getWalletById.mockResolvedValue({
        ...mockWallet(),
        transactionPin: "notempty",
      });
      await expect(
        service.withdrawToSettlementAccount(mockTrx, "1", {
          amount: 100,
          remark: "",
          transactionPin: "wrong",
        }),
      ).rejects.toThrow("Invalid credentials");
    });

    it("throws if wallet is not active", async () => {
      walletRepository.getWalletById.mockResolvedValue({
        ...mockWallet(),
        status: WalletStatus.INACTIVE,
      });
      await expect(
        service.withdrawToSettlementAccount(mockTrx, "1", {
          amount: 100,
          remark: "",
          transactionPin: "1234",
        }),
      ).rejects.toThrow("Inactive wallet");
    });

    it("throws if insufficient funds", async () => {
      walletRepository.getWalletById.mockResolvedValue({ ...mockWallet({ balance: "50.00" }) });
      await expect(
        service.withdrawToSettlementAccount(mockTrx, "1", {
          amount: 100,
          remark: "",
          transactionPin: "1234",
        }),
      ).rejects.toThrow("Transfer failed");
    });

    it("calls debitWalletBalance on success", async () => {
      walletRepository.getWalletById.mockResolvedValue(mockWallet());
      vi.spyOn(service as any, "debitWalletBalance").mockResolvedValue("debitTx");
      const result = await service.withdrawToSettlementAccount(mockTrx, "1", {
        amount: 100,
        remark: "test",
        transactionPin: "1234",
      });
      expect(result).toBe("debitTx");
    });
  });

  describe("private methods", () => {
    it("getTransactionFee returns correct fee", () => {
      expect((service as any).getTransactionFee(100)).toBe(10);
      expect((service as any).getTransactionFee(10000)).toBe(25);
      expect((service as any).getTransactionFee(100000)).toBe(50);
    });

    it("creditWalletBalance throws if wallet not found", async () => {
      walletRepository.increaseWalletBalance.mockResolvedValue(undefined);
      walletRepository.getWalletById.mockResolvedValue(undefined);
      await expect(
        (service as any).creditWalletBalance(mockTrx, 1, 100, {}, TransactionChannel.WALLET),
      ).rejects.toThrow("Something went wrong");
    });

    it("debitWalletBalance throws if wallet not found", async () => {
      walletRepository.decreaseWalletBalance.mockResolvedValue(undefined);
      walletRepository.getWalletById.mockResolvedValue(undefined);
      await expect(
        (service as any).debitWalletBalance(mockTrx, 1, 100, 10, {}, TransactionChannel.WALLET),
      ).rejects.toThrow("Something went wrong");
    });

    it("creditWalletBalance sends receipt if user found", async () => {
      walletRepository.increaseWalletBalance.mockResolvedValue(undefined);
      walletRepository.getWalletById.mockResolvedValue(mockWallet());
      transactionRepository.createTransaction.mockResolvedValue(
        mockTransaction({ type: TransactionType.CREDIT }),
      );
      userRepository.getUserById.mockResolvedValue(mockUser());
      await (service as any).creditWalletBalance(
        mockTrx,
        1,
        100,
        { receiver: {}, sender: {} },
        TransactionChannel.WALLET,
        "remark",
      );
      expect(resendService.sendTransactionReceipt).toHaveBeenCalled();
    });

    it("debitWalletBalance sends receipt if user found", async () => {
      walletRepository.decreaseWalletBalance.mockResolvedValue(undefined);
      walletRepository.getWalletById.mockResolvedValue(mockWallet());
      transactionRepository.createTransaction.mockResolvedValue(
        mockTransaction({ type: TransactionType.DEBIT }),
      );
      userRepository.getUserById.mockResolvedValue(mockUser());
      await (service as any).debitWalletBalance(
        mockTrx,
        1,
        100,
        10,
        { receiver: {}, sender: {} },
        TransactionChannel.WALLET,
        "remark",
      );
      expect(resendService.sendTransactionReceipt).toHaveBeenCalled();
    });
  });
});
