import Knex from "knex";

import database from "../configs/database.js";
import { SCHEMA_TABLES } from "../helpers/constants.js";
import WalletModel from "../models/WalletModel.js";
import { Repository } from "./Repository.js";

const walletColumns: (keyof WalletModel)[] = [
  "id",
  "accountName",
  "accountNumber",
  "balance",
  "createdAt",
  "currency",
  "isSettlementAccountSet",
  "isTransactionPinSet",
  "lienBalance",
  "settlementAccountName",
  "settlementAccountNumber",
  "settlementBankCode",
  "status",
  "updatedAt",
  "userId",
] as const;

export class WalletRepository extends Repository<WalletModel> {
  constructor(databaseInstance = database) {
    super(SCHEMA_TABLES.WALLETS, databaseInstance);
  }

  async addPinToWallet(
    trx: Knex.Knex.Transaction,
    id: WalletModel["id"],
    pin: WalletModel["transactionPin"],
  ) {
    await this.table
      .update({ isTransactionPinSet: true, transactionPin: pin })
      .where({ id })
      .transacting(trx);

    return this.table
      .select<Omit<WalletModel, "transactionPin">>(walletColumns)
      .where({ id })
      .first();
  }

  async addSettlementAccountToWallet(
    trx: Knex.Knex.Transaction,
    id: WalletModel["id"],
    settlementAccount: Pick<
      WalletModel,
      "settlementAccountName" | "settlementAccountNumber" | "settlementBankCode"
    >,
  ) {
    await this.table
      .update({ ...settlementAccount, isSettlementAccountSet: true })
      .where({ id })
      .transacting(trx);

    return this.table
      .select<Omit<WalletModel, "transactionPin">>(walletColumns)
      .where({ id })
      .first();
  }

  async createUserWallet(
    trx: Knex.Knex.Transaction,
    walletData: Pick<WalletModel, "accountName" | "accountNumber" | "userId">,
  ) {
    const id = this.uuid;
    await this.table.insert({ ...walletData, id }).transacting(trx);
    return await this.table
      .select<Omit<WalletModel, "transactionPin">>(walletColumns)
      .where({ id })
      .transacting(trx)
      .first();
  }

  async decreaseWalletBalance(trx: Knex.Knex.Transaction, id: WalletModel["id"], amount: number) {
    await this.table.decrement("balance", amount).where({ id }).transacting(trx);
  }

  async getWalletByAccountNumber(accountNumber: WalletModel["accountNumber"]) {
    return await this.table
      .select("accountName", "accountNumber", "id")
      .where({ accountNumber })
      .first();
  }

  async getWalletById(trx: Knex.Knex.Transaction, id: WalletModel["id"]) {
    return await this.table.transacting(trx).forUpdate().where({ id }).first();
  }

  async getWalletByIdAndUserId(id: WalletModel["id"], userId: WalletModel["userId"]) {
    return await this.table
      .select<Omit<WalletModel, "transactionPin">>(walletColumns)
      .where({ id, userId })
      .first();
  }

  async getWalletByPinAndId(
    trx: Knex.Knex.Transaction,
    id: WalletModel["id"],
    pin: WalletModel["transactionPin"],
  ) {
    return await this.table.transacting(trx).forUpdate().where({ id, transactionPin: pin }).first();
  }

  async increaseWalletBalance(trx: Knex.Knex.Transaction, id: WalletModel["id"], amount: number) {
    await this.table.increment("balance", amount).where({ id }).transacting(trx);
  }
}
