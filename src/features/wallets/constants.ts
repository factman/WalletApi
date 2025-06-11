export enum WALLETS_ROUTES {
  GET_NAME_ENQUIRY = "/name-enquiry/:accountNumber",
  GET_WALLET = "/:id",
  POST_ADD_SETTLEMENT_ACCOUNT = "/:id/settlement-account",
  POST_CREATE_TRANSACTION_PIN = "/:id/transaction-pin",
  POST_FUND_WALLET = "/:id/fund-wallet",
}
