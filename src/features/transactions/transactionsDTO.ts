import { PaginationMeta } from "../../helpers/types";
import TransactionModel from "../../models/TransactionModel";

export interface FundTransferRequest {
  amount: number;
  beneficiaryAccountNumber: string;
  remark?: string;
  transactionPin: string;
}

export interface FundWithdrawalRequest {
  amount: number;
  remark?: string;
  transactionPin: string;
}

export interface GetTransactionHistoryResponse {
  meta: PaginationMeta;
  transactions: Pick<
    TransactionModel,
    "amount" | "currency" | "fee" | "id" | "remark" | "status" | "type"
  >[];
}
