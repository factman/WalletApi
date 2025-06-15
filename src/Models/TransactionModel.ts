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
  createdAt: Date;
  currency: string;
  fee: number;
  id: string;
  metadata: TransactionMetaData;
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
