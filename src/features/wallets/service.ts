import { StatusCodes } from "http-status-codes";
import Knex from "knex";

import database from "../../configs/database.js";
import { CustomError } from "../../helpers/errorInstance.js";
import { generateSessionId, hashPin } from "../../helpers/utilities.js";
import {
  TransactionChannel,
  TransactionMetaData,
  TransactionStatus,
  TransactionType,
} from "../../models/TransactionModel.js";
import WalletModel, { WalletStatus } from "../../models/WalletModel.js";
import { TransactionRepository } from "../../repositories/TransactionRepository.js";
import { WalletRepository } from "../../repositories/WalletRepository.js";
import { FundWalletRequest } from "./walletsDTO.js";

export class WalletService {
  private transactionRepository: TransactionRepository;
  private walletRepository: WalletRepository;

  constructor(
    walletRepository = new WalletRepository(),
    transactionRepository = new TransactionRepository(),
  ) {
    this.walletRepository = walletRepository;
    this.transactionRepository = transactionRepository;
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

  async getUserWallet(id: WalletModel["id"], userId: WalletModel["userId"]) {
    const wallet = await this.walletRepository.getWalletByIdAndUserId(id, userId);
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
      amount,
      channel: TransactionChannel.BANK_TRANSFER,
      closingBalance: wallet.balance,
      fee: 0,
      metadata,
      openingBalance: wallet.balance - amount,
      remark: `Wallet top-up from ${metadata.sender.accountName}`,
      sessionId: generateSessionId(),
      settlementDate: database.fn.now() as unknown as string,
      status: TransactionStatus.COMPLETED,
      type: TransactionType.CREDIT,
      userId: wallet.userId,
      walletId: wallet.id,
    });
    if (!transaction)
      throw new CustomError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Something went wrong, please try again later.",
      });

    return transaction;
  }
}
