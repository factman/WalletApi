import Knex from "knex";

import { hashPin } from "../../helpers/utilities.js";
import WalletModel from "../../models/WalletModel.js";
import { WalletRepository } from "../../repositories/WalletRepository.js";

export class WalletService {
  private walletRepository: WalletRepository;

  constructor(walletRepository = new WalletRepository()) {
    this.walletRepository = walletRepository;
  }

  async createWalletPin(trx: Knex.Knex.Transaction, id: WalletModel["id"], pin: string) {
    const pinHash = await hashPin(pin);
    const wallet = await this.walletRepository.addPinToWallet(trx, id, pinHash);
    if (!wallet) return { error: "Invalid data" };

    return { wallet };
  }

  async getAccountDetails(accountNumber: WalletModel["accountNumber"]) {
    const account = await this.walletRepository.getWalletByAccountNumber(accountNumber);
    if (!account) return { error: "Account not found" };

    return { account };
  }

  async getUserWallet(id: WalletModel["id"], userId: WalletModel["userId"]) {
    const wallet = await this.walletRepository.getWalletByIdAndUserId(id, userId);
    if (!wallet) return { error: "Wallet not found" };

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
    if (!wallet) return { error: "Invalid data" };

    return { wallet };
  }
}
