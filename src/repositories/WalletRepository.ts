import Knex from "knex";

import database from "../configs/database.js";
import { SCHEMA_TABLES } from "../helpers/constants.js";
import WalletModel from "../models/WalletModel.js";
import { Repository } from "./Repository.js";

export class WalletRepository extends Repository<WalletModel> {
  constructor(databaseInstance = database) {
    super(SCHEMA_TABLES.WALLETS, databaseInstance);
  }

  async createUserWallet(
    trx: Knex.Knex.Transaction,
    walletData: Pick<WalletModel, "accountName" | "accountNumber" | "userId">,
  ) {
    return await this.table
      .transacting(trx)
      .insert({ ...walletData }, "*")
      .first();
  }
}
