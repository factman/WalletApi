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
  createdAt: string;
  currency: string;
  fee: number;
  id: string;
  metadata: Record<string, unknown>;
  openingBalance: number;
  remark: string;
  sessionId: string;
  settlementDate: null | string;
  status: TransactionStatus;
  type: TransactionType;
  updatedAt: string;
  userId: string;
  walletId: string;
}
