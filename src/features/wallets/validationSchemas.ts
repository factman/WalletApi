import { z } from "zod";

import { buildStrictSchema } from "../../helpers/validations";
import {
  accountNumberSchema,
  amountSchema,
  transactionPinSchema,
} from "../../validations/validationSchemas";
import {
  AddSettlementAccountRequest,
  CreateTransactionPinRequest,
  FundWalletRequest,
  NameEnquiryRequestParams,
} from "./walletsDTO";

const bankCodeSchema = z
  .string()
  .nonempty()
  .min(3)
  .max(6)
  .regex(/^\d+$/, { message: "Bank code must contain only digits" });

export const addSettlementAccountRequestSchema = buildStrictSchema<AddSettlementAccountRequest>({
  accountName: z.string().nonempty(),
  accountNumber: accountNumberSchema,
  bankCode: bankCodeSchema,
});

export const createTransactionPinRequestSchema = buildStrictSchema<CreateTransactionPinRequest>({
  pin: transactionPinSchema,
});

export const nameEnquiryRequestSchema = buildStrictSchema<NameEnquiryRequestParams>({
  accountNumber: accountNumberSchema,
});

export const fundWalletRequestSchema = buildStrictSchema<FundWalletRequest>({
  amount: amountSchema,
  senderAccountName: z.string().nonempty(),
  senderAccountNumber: accountNumberSchema,
  senderBankCode: bankCodeSchema,
});
