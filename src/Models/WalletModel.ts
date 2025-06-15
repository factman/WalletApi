export enum WalletStatus {
  ACTIVE = "active",
  BLOCKED = "blocked",
  INACTIVE = "inactive",
}

export default interface WalletModel {
  accountName: string;
  accountNumber: string;
  balance: number;
  createdAt: Date;
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
  updatedAt: Date;
  userId: string;
}
