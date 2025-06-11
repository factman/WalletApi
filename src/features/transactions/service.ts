import { StatusCodes } from "http-status-codes";
import Knex from "knex";

import database from "../../configs/database.js";
import { CustomError } from "../../helpers/errorInstance.js";
import { generateSessionId, hashPin } from "../../helpers/utilities.js";
import TransactionModel, {
  TransactionChannel,
  TransactionMetaData,
  TransactionStatus,
  TransactionType,
} from "../../models/TransactionModel.js";
import WalletModel, { WalletStatus } from "../../models/WalletModel.js";
import { TransactionRepository } from "../../repositories/TransactionRepository.js";
import { WalletRepository } from "../../repositories/WalletRepository.js";
import { FundTransferRequest, FundWithdrawalRequest } from "./transactionsDTO.js";

export class TransactionService {
  private transactionRepository: TransactionRepository;
  private walletRepository: WalletRepository;

  constructor(
    transactionRepository = new TransactionRepository(),
    walletRepository = new WalletRepository(),
  ) {
    this.transactionRepository = transactionRepository;
    this.walletRepository = walletRepository;
  }

  async getBeneficiaryWallet(accountNumber: WalletModel["accountNumber"]) {
    const wallet = await this.walletRepository.getWalletByAccountNumber(accountNumber);
    if (!wallet)
      throw new CustomError("Wallet not found", StatusCodes.BAD_REQUEST, {
        message: "Invalid beneficiary account number",
      });

    return wallet;
  }

  async getWalletHistory(walletId: TransactionModel["walletId"], offset: number, limit: number) {
    return await this.transactionRepository.getTransactionsByWalletId(walletId, offset, limit);
  }

  async getWalletTransaction(
    transactionId: TransactionModel["id"],
    walletId: TransactionModel["walletId"],
  ) {
    const transaction = await this.transactionRepository.getWalletTransactionById(
      transactionId,
      walletId,
    );
    if (!transaction)
      throw new CustomError("Not found", StatusCodes.NOT_FOUND, {
        message: "Transaction not found",
      });

    return { transaction };
  }

  async transferToWallet(
    trx: Knex.Knex.Transaction,
    senderWalletId: WalletModel["id"],
    receiverWallet: Pick<WalletModel, "accountName" | "accountNumber" | "id">,
    transferData: FundTransferRequest,
  ) {
    const hashedPin = await hashPin(transferData.transactionPin);
    const senderWallet = await this.walletRepository.getWalletByPinAndId(
      trx,
      senderWalletId,
      hashedPin,
    );
    if (!senderWallet)
      throw new CustomError("Invalid credentials", StatusCodes.BAD_REQUEST, {
        message: "Incorrect pin",
      });

    if (senderWallet.status !== WalletStatus.ACTIVE)
      throw new CustomError("Inactive wallet", StatusCodes.BAD_REQUEST, {
        message: `Wallet is ${senderWallet.status}`,
      });

    const fee = this.getTransactionFee(transferData.amount);
    const total = transferData.amount + fee;
    if (senderWallet.balance < total)
      throw new CustomError("Transfer failed", StatusCodes.BAD_REQUEST, {
        message: "Insufficient funds",
      });

    const metaData = {
      receiver: {
        accountName: receiverWallet.accountName,
        accountNumber: receiverWallet.accountNumber,
      },
      sender: {
        accountName: senderWallet.accountName,
        accountNumber: senderWallet.accountNumber,
      },
    };

    const debitTransaction = await this.debitWalletBalance(
      trx,
      senderWalletId,
      transferData.amount,
      fee,
      metaData,
      transferData.remark,
    );
    await this.creditWalletBalance(
      trx,
      receiverWallet.id,
      transferData.amount,
      metaData,
      transferData.remark,
    );

    return debitTransaction;
  }

  async withdrawToSettlementAccount(
    trx: Knex.Knex.Transaction,
    walletId: WalletModel["id"],
    withdrawData: FundWithdrawalRequest,
  ) {
    const hashedPin = await hashPin(withdrawData.transactionPin);
    const wallet = await this.walletRepository.getWalletByPinAndId(trx, walletId, hashedPin);
    if (!wallet)
      throw new CustomError("Invalid credentials", StatusCodes.BAD_REQUEST, {
        message: "Incorrect pin",
      });

    if (wallet.status !== WalletStatus.ACTIVE)
      throw new CustomError("Inactive wallet", StatusCodes.BAD_REQUEST, {
        message: `Wallet is ${wallet.status}`,
      });

    const fee = this.getTransactionFee(withdrawData.amount);
    const total = withdrawData.amount + fee;
    if (wallet.balance < total)
      throw new CustomError("Transfer failed", StatusCodes.BAD_REQUEST, {
        message: "Insufficient funds",
      });

    const metaData = {
      receiver: {
        accountName: wallet.settlementAccountName ?? "",
        accountNumber: wallet.settlementAccountNumber ?? "",
      },
      sender: {
        accountName: wallet.accountName,
        accountNumber: wallet.accountNumber,
      },
    };

    const debitTransaction = await this.debitWalletBalance(
      trx,
      walletId,
      withdrawData.amount,
      fee,
      metaData,
      withdrawData.remark,
    );

    return debitTransaction;
  }

  private async creditWalletBalance(
    trx: Knex.Knex.Transaction,
    walletId: WalletModel["id"],
    amount: number,
    metadata: TransactionMetaData,
    remark?: string,
  ) {
    await this.walletRepository.increaseWalletBalance(trx, walletId, amount);
    const wallet = await this.walletRepository.getWalletById(trx, walletId);
    if (!wallet)
      throw new CustomError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Something went wrong, please try again later.",
      });

    const transaction = await this.transactionRepository.createTransaction(trx, {
      amount,
      channel: TransactionChannel.WALLET,
      closingBalance: wallet.balance,
      fee: 0,
      metadata,
      openingBalance: wallet.balance - amount,
      remark:
        remark ??
        `Transfer from ${metadata.sender.accountName} To ${metadata.receiver.accountName}`,
      sessionId: generateSessionId(),
      settlementDate: database.fn.now() as unknown as string,
      status: TransactionStatus.COMPLETED,
      type: TransactionType.CREDIT,
      userId: wallet.userId,
      walletId,
    });
    if (!transaction)
      throw new CustomError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Something went wrong, please try again later.",
      });

    return transaction;
  }

  private async debitWalletBalance(
    trx: Knex.Knex.Transaction,
    walletId: WalletModel["id"],
    amount: number,
    fee: number,
    metadata: TransactionMetaData,
    remark?: string,
  ) {
    await this.walletRepository.decreaseWalletBalance(trx, walletId, amount);
    const wallet = await this.walletRepository.getWalletById(trx, walletId);
    if (!wallet)
      throw new CustomError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Something went wrong, please try again later.",
      });

    const transaction = await this.transactionRepository.createTransaction(trx, {
      amount,
      channel: TransactionChannel.WALLET,
      closingBalance: wallet.balance,
      fee,
      metadata,
      openingBalance: wallet.balance + amount + fee,
      remark:
        remark ??
        `Transfer To ${metadata.receiver.accountName} From ${metadata.sender.accountName}`,
      sessionId: generateSessionId(),
      settlementDate: database.fn.now() as unknown as string,
      status: TransactionStatus.COMPLETED,
      type: TransactionType.DEBIT,
      userId: wallet.userId,
      walletId,
    });
    if (!transaction)
      throw new CustomError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Something went wrong, please try again later.",
      });

    return transaction;
  }

  private getTransactionFee(amount: number) {
    if (amount <= 5000) return 10;
    if (amount <= 50000) return 25;

    return 50;
  }
}
