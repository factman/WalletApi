import { StatusCodes } from "http-status-codes";
import Knex from "knex";

import database from "../../configs/database";
import { CustomError } from "../../helpers/errorInstance";
import { generateSessionId, hashPin } from "../../helpers/utilities";
import {
  TransactionChannel,
  TransactionMetaData,
  TransactionStatus,
  TransactionType,
} from "../../models/TransactionModel";
import WalletModel, { WalletStatus } from "../../models/WalletModel";
import { TransactionRepository } from "../../repositories/TransactionRepository";
import { UserRepository } from "../../repositories/UserRepository";
import { WalletRepository } from "../../repositories/WalletRepository";
import { ResendService } from "../../services/ResendService";
import { FundWalletRequest } from "./walletsDTO";

export class WalletService {
  private resendService: ResendService;
  private transactionRepository: TransactionRepository;
  private userRepository: UserRepository;
  private walletRepository: WalletRepository;

  constructor(
    walletRepository = new WalletRepository(),
    transactionRepository = new TransactionRepository(),
    resendService = new ResendService(),
    userRepository = new UserRepository(),
  ) {
    this.walletRepository = walletRepository;
    this.transactionRepository = transactionRepository;
    this.resendService = resendService;
    this.userRepository = userRepository;
  }

  async createWalletPin(trx: Knex.Knex.Transaction, id: WalletModel["id"], pin: string) {
    const pinHash = await hashPin(pin);
    const wallet = await this.walletRepository.addPinToWallet(trx, id, pinHash);
    if (!wallet)
      throw new CustomError("Invalid Request", StatusCodes.BAD_REQUEST, {
        message: "Invalid data",
      });

    return { wallet };
  }

  async fundUserWallet(
    trx: Knex.Knex.Transaction,
    walletId: WalletModel["id"],
    fundingData: FundWalletRequest,
  ) {
    const wallet = await this.walletRepository.getWalletById(trx, walletId);
    if (!wallet)
      throw new CustomError("Not Found", StatusCodes.NOT_FOUND, {
        message: "Wallet not found",
      });

    if (wallet.status !== WalletStatus.ACTIVE)
      throw new CustomError("Invalid Request", StatusCodes.BAD_REQUEST, {
        message: `Wallet is ${wallet.status}`,
      });

    const metaData: TransactionMetaData = {
      receiver: {
        accountName: wallet.accountName,
        accountNumber: wallet.accountNumber,
      },
      sender: {
        accountName: fundingData.senderAccountName,
        accountNumber: fundingData.senderAccountNumber,
      },
    };

    const creditTransaction = await this.creditWalletBalance(
      trx,
      wallet,
      fundingData.amount,
      metaData,
    );

    return creditTransaction;
  }

  async getAccountDetails(accountNumber: WalletModel["accountNumber"]) {
    const account = await this.walletRepository.getWalletByAccountNumber(accountNumber);
    if (!account)
      throw new CustomError("Not Found", StatusCodes.NOT_FOUND, {
        message: "Account not found",
      });

    return { account };
  }

  async getUserWallet(userId: WalletModel["userId"]) {
    const wallet = await this.walletRepository.getWalletByUserId(userId);
    if (!wallet)
      throw new CustomError("Not Found", StatusCodes.NOT_FOUND, {
        message: "Wallet not found",
      });

    return { wallet };
  }

  async setWalletSettlementAccount(
    trx: Knex.Knex.Transaction,
    id: WalletModel["id"],
    account: Pick<
      WalletModel,
      "settlementAccountName" | "settlementAccountNumber" | "settlementBankCode"
    >,
  ) {
    const wallet = await this.walletRepository.addSettlementAccountToWallet(trx, id, account);
    if (!wallet)
      throw new CustomError("Invalid Request", StatusCodes.BAD_REQUEST, {
        message: "Invalid data",
      });

    return { wallet };
  }

  private async creditWalletBalance(
    trx: Knex.Knex.Transaction,
    wallet: WalletModel,
    amount: number,
    metadata: TransactionMetaData,
  ) {
    await this.walletRepository.increaseWalletBalance(trx, wallet.id, amount);
    const updatedWallet = await this.walletRepository.getWalletById(trx, wallet.id);
    if (!updatedWallet)
      throw new CustomError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Something went wrong, please try again later.",
      });

    const transaction = await this.transactionRepository.createTransaction(trx, {
      amount: amount.toFixed(2),
      channel: TransactionChannel.BANK_TRANSFER,
      closingBalance: updatedWallet.balance,
      fee: "0.00",
      metadata: JSON.stringify(metadata),
      openingBalance: (parseFloat(updatedWallet.balance) - amount).toFixed(2),
      remark: `Wallet top-up from ${metadata.sender.accountName}`,
      sessionId: generateSessionId(),
      settlementDate: database.fn.now() as unknown as Date,
      status: TransactionStatus.COMPLETED,
      type: TransactionType.CREDIT,
      userId: wallet.userId,
      walletId: wallet.id,
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
}
