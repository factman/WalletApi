import Knex from "knex";

import database from "../configs/database.js";
import { SCHEMA_TABLES } from "../helpers/constants.js";
import TransactionModel from "../models/TransactionModel.js";
import { Repository } from "./Repository.js";

export class TransactionRepository extends Repository<TransactionModel> {
  constructor(databaseInstance = database) {
    super(SCHEMA_TABLES.TRANSACTIONS, databaseInstance);
  }

  async createTransaction(
    trx: Knex.Knex.Transaction,
    transaction: Omit<TransactionModel, "createdAt" | "currency" | "id" | "updatedAt">,
  ) {
    const id = this.uuid;
    await this.table.insert({ ...transaction, id }).transacting(trx);

    return await this.table.where({ id }).first();
  }

  async getTransactionsByWalletId(
    walletId: TransactionModel["walletId"],
    offset: number,
    limit: number,
  ) {
    const counter = await this.table.count({ count: "*" }).where({ walletId }).first();
    if (!counter?.count) return { count: 0, transactions: [] };

    const transactions = await this.table
      .select("amount", "currency", "fee", "id", "remark", "status", "type")
      .where({ walletId })
      .orderBy("createdAt", "desc")
      .offset(offset)
      .limit(limit);

    return { count: counter.count as number, transactions };
  }

  async getWalletTransactionById(
    id: TransactionModel["id"],
    walletId: TransactionModel["walletId"],
  ) {
    return await this.table.where({ id, walletId }).first();
  }
}
