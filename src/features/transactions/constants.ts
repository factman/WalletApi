export enum TRANSACTION_ROUTES {
  GET_TRANSACTION = "/:transactionId/wallets/:walletId",
  GET_TRANSACTIONS_HISTORY = "/Wallets/:walletId/history",
  POST_FUND_TRANSFER = "/:walletId/transfer",
  POST_FUND_WITHDRAWAL = "/:walletId/withdraw",
}
