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
  amount: number;
  channel: TransactionChannel;
  closingBalance: number;
  createdAt: string;
  currency: string;
  fee: number;
  id: string;
  metadata: TransactionMetaData;
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
