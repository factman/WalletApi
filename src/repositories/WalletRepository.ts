import Knex from "knex";

import database from "@/configs/database";
import { SCHEMA_TABLES } from "@/helpers/constants";
import WalletModel from "@/models/WalletModel";

import { Repository } from "./Repository";

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
