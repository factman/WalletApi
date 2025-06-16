import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import Knex from "knex";

import database from "../../configs/database.js";
import { CustomError } from "../../helpers/errorInstance.js";
import { generateSessionId } from "../../helpers/utilities.js";
import TransactionModel, {
  TransactionChannel,
  TransactionMetaData,
  TransactionStatus,
  TransactionType,
} from "../../models/TransactionModel.js";
import WalletModel, { WalletStatus } from "../../models/WalletModel.js";
import { TransactionRepository } from "../../repositories/TransactionRepository.js";
import { UserRepository } from "../../repositories/UserRepository.js";
import { WalletRepository } from "../../repositories/WalletRepository.js";
import { ResendService } from "../../services/ResendService.js";
import { FundTransferRequest, FundWithdrawalRequest } from "./transactionsDTO.js";

export class TransactionService {
  private resendService: ResendService;
  private transactionRepository: TransactionRepository;
  private userRepository: UserRepository;
  private walletRepository: WalletRepository;

  constructor(
    transactionRepository = new TransactionRepository(),
    walletRepository = new WalletRepository(),
    resendService = new ResendService(),
    userRepository = new UserRepository(),
  ) {
    this.transactionRepository = transactionRepository;
    this.walletRepository = walletRepository;
    this.resendService = resendService;
    this.userRepository = userRepository;
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
    const senderWallet = await this.walletRepository.getWalletById(trx, senderWalletId);
    if (!senderWallet)
      throw new CustomError("Invalid wallet", StatusCodes.BAD_REQUEST, {
        message: "Invalid beneficiary wallet",
      });

    if (!transferData.transactionPin)
      throw new CustomError("Invalid credentials", StatusCodes.BAD_REQUEST, {
        message: "Set transaction pin to transfer funds",
      });

    if (!bcrypt.compareSync(transferData.transactionPin, senderWallet.transactionPin ?? "")) {
      throw new CustomError("Invalid credentials", StatusCodes.BAD_REQUEST, {
        message: "Invalid transaction pin",
      });
    }

    if (senderWallet.status !== WalletStatus.ACTIVE)
      throw new CustomError("Inactive wallet", StatusCodes.BAD_REQUEST, {
        message: `Wallet is ${senderWallet.status}`,
      });

    const fee = this.getTransactionFee(transferData.amount);
    const total = transferData.amount + fee;
    if (parseFloat(senderWallet.balance) < total)
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
      TransactionChannel.WALLET,
      transferData.remark,
    );
    await this.creditWalletBalance(
      trx,
      receiverWallet.id,
      transferData.amount,
      metaData,
      TransactionChannel.WALLET,
      transferData.remark,
    );

    return debitTransaction;
  }

  async withdrawToSettlementAccount(
    trx: Knex.Knex.Transaction,
    walletId: WalletModel["id"],
    withdrawData: FundWithdrawalRequest,
  ) {
    const wallet = await this.walletRepository.getWalletById(trx, walletId);
    if (!wallet)
      throw new CustomError("Invalid wallet", StatusCodes.BAD_REQUEST, {
        message: "Invalid sender wallet",
      });

    if (!withdrawData.transactionPin)
      throw new CustomError("Invalid credentials", StatusCodes.BAD_REQUEST, {
        message: "Set transaction pin to withdraw funds",
      });

    if (!bcrypt.compareSync(withdrawData.transactionPin, wallet.transactionPin ?? "")) {
      throw new CustomError("Invalid credentials", StatusCodes.BAD_REQUEST, {
        message: "Invalid transaction pin",
      });
    }

    if (wallet.status !== WalletStatus.ACTIVE)
      throw new CustomError("Inactive wallet", StatusCodes.BAD_REQUEST, {
        message: `Wallet is ${wallet.status}`,
      });

    const fee = this.getTransactionFee(withdrawData.amount);
    const total = withdrawData.amount + fee;
    if (parseFloat(wallet.balance) < total)
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
      TransactionChannel.BANK_TRANSFER,
      withdrawData.remark,
    );

    return debitTransaction;
  }

  private async creditWalletBalance(
    trx: Knex.Knex.Transaction,
    walletId: WalletModel["id"],
    amount: number,
    metadata: TransactionMetaData,
    channel: TransactionChannel,
    remark?: string,
  ) {
    await this.walletRepository.increaseWalletBalance(trx, walletId, amount);
    const wallet = await this.walletRepository.getWalletById(trx, walletId);
    if (!wallet)
      throw new CustomError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Something went wrong, please try again later.",
      });

    const transaction = await this.transactionRepository.createTransaction(trx, {
      amount: amount.toFixed(2),
      channel,
      closingBalance: wallet.balance,
      fee: "0.00",
      metadata,
      openingBalance: (parseFloat(wallet.balance) - amount).toFixed(2),
      remark:
        remark ??
        `Transfer from ${metadata.sender.accountName} To ${metadata.receiver.accountName}`,
      sessionId: generateSessionId(),
      settlementDate: database.fn.now() as unknown as Date,
      status: TransactionStatus.COMPLETED,
      type: TransactionType.CREDIT,
      userId: wallet.userId,
      walletId,
    });
    if (!transaction)
      throw new CustomError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Something went wrong, please try again later.",
      });

    const user = await this.userRepository.getUserById(transaction.userId);
    if (user) {
      await this.resendService.sendTransactionReceipt(user.email, {
        amount: amount.toFixed(2),
        currency: transaction.currency,
        remark: transaction.remark,
        sessionId: transaction.sessionId,
        settlementDate: transaction.settlementDate,
        type: transaction.type,
      });
    }

    return transaction;
  }

  private async debitWalletBalance(
    trx: Knex.Knex.Transaction,
    walletId: WalletModel["id"],
    amount: number,
    fee: number,
    metadata: TransactionMetaData,
    channel: TransactionChannel,
    remark?: string,
  ) {
    const total = amount + fee;
    await this.walletRepository.decreaseWalletBalance(trx, walletId, total);
    const wallet = await this.walletRepository.getWalletById(trx, walletId);
    if (!wallet)
      throw new CustomError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Something went wrong, please try again later.",
      });

    console.log({
      closingBalance: wallet.balance,
      openingBalance: (parseFloat(wallet.balance) + total).toFixed(2),
      total,
      wallet: wallet.balance,
    });
    const transaction = await this.transactionRepository.createTransaction(trx, {
      amount: amount.toFixed(2),
      channel,
      closingBalance: wallet.balance,
      fee: fee.toFixed(2),
      metadata,
      openingBalance: (parseFloat(wallet.balance) + total).toFixed(2),
      remark:
        remark ??
        `Transfer To ${metadata.receiver.accountName} From ${metadata.sender.accountName}`,
      sessionId: generateSessionId(),
      settlementDate: database.fn.now() as unknown as Date,
      status: TransactionStatus.COMPLETED,
      type: TransactionType.DEBIT,
      userId: wallet.userId,
      walletId,
    });
    if (!transaction)
      throw new CustomError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Something went wrong, please try again later.",
      });

    const user = await this.userRepository.getUserById(transaction.userId);
    if (user) {
      await this.resendService.sendTransactionReceipt(user.email, {
        amount: (amount + fee).toFixed(2),
        currency: transaction.currency,
        remark: transaction.remark,
        sessionId: transaction.sessionId,
        settlementDate: transaction.settlementDate,
        type: transaction.type,
      });
    }

    return transaction;
  }

  private getTransactionFee(amount: number) {
    if (amount <= 5000) return 10;
    if (amount <= 50000) return 25;

    return 50;
  }
}
