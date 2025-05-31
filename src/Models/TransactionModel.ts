export enum TransactionTableColumns {
  AMOUNT = "amount",
  CHANNEL = "channel",
  CLOSING_BALANCE = "closingBalance",
  CREATED_AT = "createdAt",
  CURRENCY = "currency",
  FEE = "fee",
  ID = "id",
  METADATA = "metadata",
  OPENING_BALANCE = "openingBalance",
  REMARK = "remark",
  SESSION_ID = "sessionId",
  SETTLEMENT_DATE = "settlementDate",
  STATUS = "status",
  TYPE = "type",
  UPDATED_AT = "updatedAt",
  USER_ID = "userId",
  WALLET_ID = "walletId",
}

enum TransactionChannel {
  BANK_TRANSFER = "bank_transfer",
  WALLET = "wallet",
}

enum TransactionStatus {
  COMPLETED = "completed",
  FAILED = "failed",
  PENDING = "pending",
}

enum TransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
}

export default interface TransactionModel {
  amount: number;
  channel: TransactionChannel;
  closingBalance: number;
  createdAt: Date;
  currency: string;
  fee: number;
  id: string;
  metadata: Record<string, unknown>;
  openingBalance: number;
  remark: string;
  sessionId: string;
  settlementDate: Date | null;
  status: TransactionStatus;
  type: TransactionType;
  updatedAt: Date;
  userId: string;
  walletId: string;
}
