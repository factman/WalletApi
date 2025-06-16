export enum TransactionChannel {
  BANK_TRANSFER = "bank_transfer",
  WALLET = "wallet",
}

export enum TransactionStatus {
  COMPLETED = "completed",
  FAILED = "failed",
  PENDING = "pending",
}

export enum TransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
}

export interface TransactionMetaData {
  receiver: {
    accountName: string;
    accountNumber: string;
  };
  sender: {
    accountName: string;
    accountNumber: string;
  };
}

export default interface TransactionModel {
  amount: string;
  channel: TransactionChannel;
  closingBalance: string;
  createdAt: Date;
  currency: string;
  fee: string;
  id: string;
  metadata: TransactionMetaData;
  openingBalance: string;
  remark: string;
  sessionId: string;
  settlementDate: Date | null;
  status: TransactionStatus;
  type: TransactionType;
  updatedAt: Date;
  userId: string;
  walletId: string;
}
