export enum WalletTableColumns {
  ACCOUNT_NAME = "accountName",
  ACCOUNT_NUMBER = "accountNumber",
  BALANCE = "balance",
  CREATED_AT = "createdAt",
  CURRENCY = "currency",
  ID = "id",
  IS_SETTLEMENT_ACCOUNT_SET = "isSettlementAccountSet",
  IS_TRANSACTION_PIN_SET = "isTransactionPinSet",
  LIEN_BALANCE = "lienBalance",
  SETTLEMENT_ACCOUNT_NAME = "settlementAccountName",
  SETTLEMENT_ACCOUNT_NUMBER = "settlementAccountNumber",
  SETTLEMENT_BANK_CODE = "settlementBankCode",
  STATUS = "status",
  TRANSACTION_PIN = "transactionPin",
  UPDATED_AT = "updatedAt",
  USER_ID = "userId",
}

enum WalletStatus {
  ACTIVE = "active",
  BLOCKED = "blocked",
  INACTIVE = "inactive",
}

export default interface WalletModel {
  accountName: string;
  accountNumber: string;
  balance: number;
  createdAt: string;
  currency: string;
  id: string;
  isSettlementAccountSet: boolean;
  isTransactionPinSet: boolean;
  lienBalance: number;
  settlementAccountName: null | string;
  settlementAccountNumber: null | string;
  settlementBankCode: null | string;
  status: WalletStatus;
  transactionPin: null | string;
  updatedAt: string;
  userId: string;
}
