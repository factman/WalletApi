/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Knex } from "knex";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { CustomError } from "../../../helpers/errorInstance.js";
import { WalletStatus } from "../../../models/WalletModel.js";
import { WalletService } from "../service.js";

describe("WalletService", () => {
  let walletService: WalletService;
  let walletRepository: any;
  let transactionRepository: any;
  let resendService: any;
  let userRepository: any;
  let trx: Knex.Transaction;

  beforeEach(() => {
    walletRepository = {
      addPinToWallet: vi.fn(),
      addSettlementAccountToWallet: vi.fn(),
      getWalletByAccountNumber: vi.fn(),
      getWalletById: vi.fn(),
      getWalletByUserId: vi.fn(),
      increaseWalletBalance: vi.fn(),
    };
    transactionRepository = {
      createTransaction: vi.fn(),
    };
    resendService = {
      sendTransactionReceipt: vi.fn(),
    };
    userRepository = {
      getUserById: vi.fn(),
    };
    walletService = new WalletService(
      walletRepository,
      transactionRepository,
      resendService,
      userRepository,
    );
    trx = {} as Knex.Transaction;
  });

  describe("createWalletPin", () => {
    it("should add pin to wallet and return wallet", async () => {
      walletRepository.addPinToWallet.mockResolvedValue({ id: "1" });
      const result = await walletService.createWalletPin(trx, "1", "1234");
      expect(result.wallet).toEqual({ id: "1" });
    });

    it("should throw error if wallet not found", async () => {
      walletRepository.addPinToWallet.mockResolvedValue(null);
      await expect(walletService.createWalletPin(trx, "1", "1234")).rejects.toThrow(CustomError);
    });
  });

  describe("fundUserWallet", () => {
    const fundingData = {
      amount: 100,
      senderAccountName: "Alice",
      senderAccountNumber: "123",
    };

    it("should fund wallet and return transaction", async () => {
      const wallet = {
        accountName: "Bob",
        accountNumber: "456",
        balance: "100.00",
        id: 1,
        status: WalletStatus.ACTIVE,
        userId: 2,
      };
      walletRepository.getWalletById.mockResolvedValue(wallet);
      walletRepository.increaseWalletBalance.mockResolvedValue(undefined);
      walletRepository.getWalletById.mockResolvedValueOnce(wallet).mockResolvedValueOnce({
        ...wallet,
        balance: "200.00",
      });
      transactionRepository.createTransaction.mockResolvedValue({
        currency: "NGN",
        remark: "Wallet top-up from Alice",
        sessionId: "sessid",
        settlementDate: new Date(),
        type: "CREDIT",
        userId: 2,
        walletId: 1,
      });
      userRepository.getUserById.mockResolvedValue({ email: "bob@email.com" });
      resendService.sendTransactionReceipt.mockResolvedValue(undefined);

      const result = await walletService.fundUserWallet(trx, "1", fundingData as any);
      expect(result).toHaveProperty("remark", "Wallet top-up from Alice");
      expect(resendService.sendTransactionReceipt).toHaveBeenCalled();
    });

    it("should throw error if wallet not found", async () => {
      walletRepository.getWalletById.mockResolvedValue(null);
      await expect(walletService.fundUserWallet(trx, "1", fundingData as any)).rejects.toThrow(
        CustomError,
      );
    });

    it("should throw error if wallet is not active", async () => {
      walletRepository.getWalletById.mockResolvedValue({
        status: WalletStatus.BLOCKED,
      });
      await expect(walletService.fundUserWallet(trx, "1", fundingData as any)).rejects.toThrow(
        CustomError,
      );
    });
  });

  describe("getAccountDetails", () => {
    it("should return account details", async () => {
      walletRepository.getWalletByAccountNumber.mockResolvedValue({ id: "1" });
      const result = await walletService.getAccountDetails("123");
      expect(result.account).toEqual({ id: "1" });
    });

    it("should throw error if account not found", async () => {
      walletRepository.getWalletByAccountNumber.mockResolvedValue(null);
      await expect(walletService.getAccountDetails("123")).rejects.toThrow(CustomError);
    });
  });

  describe("getUserWallet", () => {
    it("should return user wallet", async () => {
      walletRepository.getWalletByUserId.mockResolvedValue({ id: "1" });
      const result = await walletService.getUserWallet("1");
      expect(result.wallet).toEqual({ id: "1" });
    });

    it("should throw error if wallet not found", async () => {
      walletRepository.getWalletByUserId.mockResolvedValue(null);
      await expect(walletService.getUserWallet("1")).rejects.toThrow(CustomError);
    });
  });

  describe("setWalletSettlementAccount", () => {
    it("should set settlement account and return wallet", async () => {
      walletRepository.addSettlementAccountToWallet.mockResolvedValue({ id: "1" });
      const result = await walletService.setWalletSettlementAccount(trx, "1", {
        settlementAccountName: "Test",
        settlementAccountNumber: "123",
        settlementBankCode: "001",
      });
      expect(result.wallet).toEqual({ id: "1" });
    });

    it("should throw error if wallet not found", async () => {
      walletRepository.addSettlementAccountToWallet.mockResolvedValue(null);
      await expect(
        walletService.setWalletSettlementAccount(trx, "1", {
          settlementAccountName: "Test",
          settlementAccountNumber: "123",
          settlementBankCode: "001",
        }),
      ).rejects.toThrow(CustomError);
    });
  });
});
