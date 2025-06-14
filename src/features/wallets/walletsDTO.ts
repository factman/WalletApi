import WalletModel from "../../models/WalletModel.js";

export interface AddSettlementAccountRequest {
  accountName: string;
  accountNumber: string;
  bankCode: string;
}

export interface CreateTransactionPinRequest {
  pin: string;
}

export interface FundWalletRequest {
  amount: number;
  senderAccountName: string;
  senderAccountNumber: string;
  senderBankCode: string;
}

export type GetWalletResponse = Omit<WalletModel, "transactionPin">;

export interface NameEnquiryRequestParams {
  accountNumber: string;
}

export interface NameEnquiryResponse {
  accountName: string;
  accountNumber: string;
  id: string;
}
