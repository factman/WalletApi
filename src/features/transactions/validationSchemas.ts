import { z } from "zod";

import { buildStrictSchema } from "../../helpers/validations";
import {
  accountNumberSchema,
  amountSchema,
  transactionPinSchema,
} from "../../validations/validationSchemas";
import { FundTransferRequest, FundWithdrawalRequest } from "./transactionsDTO";

export const walletIdParamSchema = buildStrictSchema<{ walletId: string }>({
  walletId: z.string().uuid(),
});

export const transactionAndWalletIdParamSchema = buildStrictSchema<{
  transactionId: string;
  walletId: string;
}>({
  transactionId: z.string().uuid(),
  walletId: z.string().uuid(),
});

export const fundTransferRequestSchema = buildStrictSchema<FundTransferRequest>({
  amount: amountSchema,
  beneficiaryAccountNumber: accountNumberSchema,
  remark: z.string().max(255).optional(),
  transactionPin: transactionPinSchema,
});

export const fundWithdrawalRequestSchema = buildStrictSchema<FundWithdrawalRequest>({
  amount: amountSchema,
  remark: z.string().max(255).optional(),
  transactionPin: transactionPinSchema,
});
