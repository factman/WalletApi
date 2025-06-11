import { z } from "zod";

import { buildStrictSchema } from "../../helpers/validations.js";
import { accountNumberSchema, transactionPinSchema } from "../../validations/validationSchemas.js";
import {
  AddSettlementAccountRequest,
  CreateTransactionPinRequest,
  NameEnquiryRequestParams,
} from "./walletsDTO.js";

export const addSettlementAccountRequestSchema = buildStrictSchema<AddSettlementAccountRequest>({
  accountName: z.string().nonempty(),
  accountNumber: accountNumberSchema,
  bankCode: z
    .string()
    .nonempty()
    .min(3)
    .max(6)
    .regex(/^\d+$/, { message: "Bank code must contain only digits" }),
});

export const createTransactionPinRequestSchema = buildStrictSchema<CreateTransactionPinRequest>({
  pin: transactionPinSchema,
});

export const nameEnquiryRequestSchema = buildStrictSchema<NameEnquiryRequestParams>({
  accountNumber: accountNumberSchema,
});
